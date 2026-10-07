import { describe, expect, it } from "vitest"
import {
  createCodeSample,
  createOpenAPI,
  createRequestSample,
  generateSchemaExample,
  getOperation,
  getSchema,
  getSchemaProperties,
  getSchemaTypeLabel,
  getServerUrl,
  loadOpenAPI,
  OpenAPIError,
  parseOpenAPI,
  resolveRefs,
  resolveSchema,
  validateOpenAPI,
  type APISchema,
} from "../src/index.js"
import { readFile as browserReadFile } from "../src/load/read-file.browser.js"

const base = { openapi: "3.1.0", info: { title: "T", version: "1" } }

function spec(extra: Record<string, unknown>) {
  return { ...base, ...extra }
}

describe("loading untrusted input", () => {
  it("refuses file paths and URLs when disabled", async () => {
    await expect(loadOpenAPI({ source: "/etc/passwd", allowFiles: false })).rejects.toThrow(/allowFiles/)
    await expect(loadOpenAPI({ source: "file:///etc/passwd", allowFiles: false })).rejects.toThrow(/allowFiles/)
    await expect(
      loadOpenAPI({ source: "http://169.254.169.254/latest/meta-data", allowRemote: false })
    ).rejects.toThrow(/allowRemote/)
  })

  it("rejects unsupported URL protocols", async () => {
    await expect(loadOpenAPI({ source: new URL("ftp://example.com/spec.yaml") })).rejects.toThrow(/protocol/)
  })

  it("reports a missing file instead of parsing the path as YAML", async () => {
    await expect(loadOpenAPI({ source: "./does-not-exist.yaml" })).rejects.toThrow(/not found/)
  })

  it("does not echo document content in syntax errors", async () => {
    const secret = "SECRET_TOKEN_123"
    const error = await loadOpenAPI({ source: `{"a": ${secret}}` }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(OpenAPIError)
    expect((error as Error).message).not.toContain(secret)

    const yamlError = await loadOpenAPI({ source: `a: b: ${secret}\nc: d` }).catch((e: unknown) => e)
    expect(yamlError).toBeInstanceOf(OpenAPIError)
    expect((yamlError as Error).message).not.toContain(secret)
  })

  it("enforces maxSize for inline text and remote bodies", async () => {
    await expect(loadOpenAPI({ source: `{"a": "${"x".repeat(200)}"}`, maxSize: 100 })).rejects.toThrow(
      /maxSize/
    )

    const fakeFetch = (async () =>
      new Response("x".repeat(1000), { status: 200 })) as unknown as typeof fetch
    await expect(
      loadOpenAPI({ source: "https://example.com/spec.json", fetch: fakeFetch, maxSize: 100 })
    ).rejects.toThrow(/maxSize/)
  })

  it("redacts credentials and query strings from fetch errors", async () => {
    const fakeFetch = (async () => new Response("nope", { status: 500 })) as unknown as typeof fetch
    const error = await loadOpenAPI({
      source: "https://user:pass@example.com/spec.json?token=abc",
      fetch: fakeFetch,
    }).catch((e: unknown) => e as Error)
    expect(error.message).toContain("HTTP 500")
    expect(error.message).not.toContain("pass")
    expect(error.message).not.toContain("token=abc")
  })

  it("loads remote documents through a custom fetch", async () => {
    const fakeFetch = (async () =>
      new Response(JSON.stringify(spec({ paths: {} })), { status: 200 })) as unknown as typeof fetch
    const api = await parseOpenAPI({ source: "https://example.com/openapi.json", fetch: fakeFetch })
    expect(api.info.title).toBe("T")
  })

  it("bounds YAML alias expansion (billion laughs)", async () => {
    const lines = ["a: &a [x, x, x, x, x, x, x, x, x, x]"]
    for (let i = 1; i < 10; i++) {
      const prev = String.fromCharCode(96 + i)
      const next = String.fromCharCode(97 + i)
      lines.push(`${next}: &${next} [${Array(10).fill(`*${prev}`).join(", ")}]`)
    }
    await expect(loadOpenAPI({ source: lines.join("\n") })).rejects.toThrow(OpenAPIError)
  })

  it("keeps unquoted YAML versions as written", async () => {
    const api = await parseOpenAPI({
      source: "openapi: 3.1.0\ninfo:\n  title: T\n  version: 1.0\npaths: {}\n",
    })
    expect(api.info.version).toBe("1.0")
  })

  it("explains that the browser build cannot read files", async () => {
    await expect(browserReadFile()).rejects.toThrow(/only supported in Node/)
  })
})

describe("prototype pollution", () => {
  it("treats __proto__ keys as data", async () => {
    const source = `{
      "openapi": "3.1.0",
      "info": { "title": "T", "version": "1" },
      "paths": { "__proto__": { "get": { "responses": { "200": { "description": "ok" } } } } },
      "components": {
        "schemas": { "__proto__": { "type": "object", "properties": { "polluted": { "type": "string" } } } },
        "securitySchemes": { "__proto__": { "type": "http", "scheme": "bearer" } }
      }
    }`
    const api = await parseOpenAPI({ source })

    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect(Object.getPrototypeOf(api.schemas)).toBe(Object.prototype)
    expect(Object.keys(api.schemas)).toEqual(["__proto__"])
    expect(Object.keys(api.paths)).toEqual(["__proto__"])
    expect(Object.keys(api.securitySchemes)).toEqual(["__proto__"])
  })

  it("never resolves refs or lookups into Object.prototype", async () => {
    const api = await parseOpenAPI({
      source: spec({
        paths: {
          "/x": {
            get: {
              responses: {
                "200": {
                  description: "ok",
                  content: { "application/json": { schema: { $ref: "#/components/constructor" } } },
                },
              },
            },
          },
        },
        components: { schemas: { A: { type: "string" } } },
      }),
    })

    expect(api.warnings.some((w) => w.includes("#/components/constructor"))).toBe(true)
    expect(getSchema(api, "constructor")).toBeUndefined()
    expect(getSchema(api, "toString")).toBeUndefined()
    expect(resolveSchema({ $ref: "#/components/schemas/constructor" }, api.schemas)).toEqual({
      $ref: "#/components/schemas/constructor",
    })
  })
})

describe("resource limits", () => {
  it("resolves fan-out ref graphs in linear time", () => {
    // S0 references S1 twice, S1 references S2 twice, ... → 2^40 expansions without memoization.
    const schemas: Record<string, unknown> = {}
    for (let i = 0; i < 40; i++) {
      schemas[`S${i}`] = {
        type: "object",
        properties: {
          left: { $ref: `#/components/schemas/S${i + 1}` },
          right: { $ref: `#/components/schemas/S${i + 1}` },
        },
      }
    }
    schemas.S40 = { type: "string" }

    const started = Date.now()
    const { warnings } = resolveRefs(spec({ components: { schemas } }))
    expect(warnings).toEqual([])
    expect(Date.now() - started).toBeLessThan(1000)
  })

  it("rejects documents nested beyond maxDepth instead of overflowing the stack", async () => {
    let deep: Record<string, unknown> = { type: "string" }
    for (let i = 0; i < 2000; i++) deep = { type: "object", properties: { a: deep } }

    const error = await parseOpenAPI({ source: spec({ components: { schemas: { Deep: deep } } }) }).catch(
      (e: unknown) => e as OpenAPIError
    )
    expect(error).toBeInstanceOf(OpenAPIError)
    expect(error.code).toBe("OPENAPI_TOO_DEEP")
  })

  it("bounds generated examples for recursive and huge schemas", () => {
    const wide: APISchema = { type: "object", properties: {} }
    for (let i = 0; i < 50; i++) {
      wide.properties![`p${i}`] = { type: "object", properties: Object.fromEntries(
        Array.from({ length: 50 }, (_, j) => [`q${j}`, { type: "string" }])
      ) }
    }
    const example = generateSchemaExample(wide, { maxNodes: 200 })
    expect(JSON.stringify(example).length).toBeLessThan(20_000)

    const recursive: APISchema = {
      type: "object",
      ref: "#/components/schemas/Node",
      properties: { child: { type: "object", ref: "#/components/schemas/Node", properties: {} } },
    }
    expect(generateSchemaExample(recursive)).toEqual({ child: null })
  })
})

describe("URL sanitizing", () => {
  it("drops script URLs from links in the model", async () => {
    const api = await parseOpenAPI({
      source: spec({
        info: {
          title: "T",
          version: "1",
          termsOfService: "javascript:alert(1)",
          contact: { url: " JaVaScRiPt:alert(1)" },
          license: { name: "MIT", url: "data:text/html,<script>alert(1)</script>" },
        },
        externalDocs: { url: "javascript:alert(1)" },
        tags: [{ name: "a", externalDocs: { url: "https://ok.example.com" } }],
        paths: {},
      }),
    })

    expect(api.info.termsOfService).toBeUndefined()
    expect(api.info.contact?.url).toBeUndefined()
    expect(api.info.license?.url).toBeUndefined()
    expect(api.externalDocs).toBeUndefined()
  })
})

describe("normalization edge cases", () => {
  it("makes operation ids unique and URL-safe", async () => {
    const api = await parseOpenAPI({
      source: spec({
        paths: {
          "/a-b": { get: { responses: {} } },
          "/a/b": { get: { responses: {} } },
          "/x": { get: { operationId: "get pet/{id}", responses: {} } },
          "/y": { get: { operationId: "dup", responses: {} }, post: { operationId: "dup", responses: {} } },
        },
      }),
    })

    expect(api.operations.map((op) => op.id)).toEqual(["get-a-b", "get-a-b-2", "get-pet-id", "dup", "dup-2"])
    expect(getOperation(api, "get pet/{id}")?.id).toBe("get-pet-id")
  })

  it("skips invalid parameters and applies spec defaults", async () => {
    const api = await parseOpenAPI({
      source: spec({
        paths: {
          "/items/{id}": {
            parameters: [{ name: "id", in: "path", schema: { type: "string" } }],
            get: {
              parameters: [
                { in: "query" },
                { name: "bad", in: "body" },
                { name: "tags", in: "query", style: "form", explode: false, schema: { type: "array" } },
                { name: "X-Trace", in: "header" },
                { name: "x-trace", in: "header", required: true },
              ],
              responses: {},
            },
          },
        },
      }),
    })

    const op = api.operations[0]!
    expect(op.parameters.map((p) => `${p.in}:${p.name}`)).toEqual(["path:id", "query:tags", "header:x-trace"])
    expect(op.parametersByLocation.path[0]?.required).toBe(true)
    expect(op.parametersByLocation.path[0]?.style).toBe("simple")
    expect(op.parametersByLocation.query[0]?.explode).toBe(false)
  })

  it("understands status ranges and ignores invalid status keys", async () => {
    const api = await parseOpenAPI({
      source: spec({
        paths: {
          "/x": {
            get: {
              responses: {
                default: { description: "error" },
                "5XX": { description: "server" },
                "2xx": { description: "any success" },
                "200": { description: "ok" },
                "x-extension": { description: "ignored" },
                "999": { description: "invalid" },
              },
            },
          },
        },
      }),
    })

    const responses = api.operations[0]!.responses
    expect(responses.map((r) => r.status)).toEqual(["200", "2XX", "5XX", "default"])
    expect(responses[1]).toMatchObject({ isRange: true, isSuccess: true, statusCode: undefined })
    expect(responses[2]).toMatchObject({ isRange: true, isError: true })
  })

  it("groups untagged operations last and supports x-displayName", async () => {
    const api = await parseOpenAPI({
      source: spec({
        tags: [{ name: "pets", "x-displayName": "Pets & Owners" }],
        paths: {
          "/a": { get: { responses: {} } },
          "/b": { get: { tags: ["pets"], responses: {} } },
        },
      }),
    })

    expect(api.tags.map((t) => [t.id, t.title])).toEqual([
      ["pets", "Pets & Owners"],
      ["default", "Default"],
    ])
    expect(api.operations[0]!.tags).toEqual([])
  })

  it("inherits servers operation → path item → document", async () => {
    const api = await parseOpenAPI({
      source: spec({
        servers: [{ url: "https://doc.example.com" }],
        paths: {
          "/a": { servers: [{ url: "https://path.example.com" }], get: { responses: {} } },
          "/b": { get: { servers: [{ url: "https://op.example.com" }], responses: {} } },
          "/c": { get: { responses: {} } },
        },
      }),
    })

    expect(api.operations.map((op) => op.servers[0]?.url)).toEqual([
      "https://path.example.com",
      "https://op.example.com",
      "https://doc.example.com",
    ])
  })

  it("explicit empty security removes inherited security", async () => {
    const api = await parseOpenAPI({
      source: spec({
        security: [{ Key: [] }],
        paths: { "/public": { get: { security: [], responses: {} } }, "/private": { get: { responses: {} } } },
      }),
    })
    expect(api.operations[0]!.security).toEqual([])
    expect(api.operations[1]!.security[0]?.schemes[0]?.name).toBe("Key")
  })

  it("merges allOf members into schema properties", () => {
    const properties = getSchemaProperties({
      allOf: [
        { type: "object", required: ["id"], properties: { id: { type: "integer" } } },
        { type: "object", properties: { name: { type: "string" } } },
      ],
    })
    expect(properties.map((p) => [p.name, p.required])).toEqual([
      ["id", true],
      ["name", false],
    ])
  })

  it("labels simple unions by their member types", () => {
    expect(getSchemaTypeLabel({ oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] })).toBe(
      "string | string[]"
    )
    expect(getSchemaTypeLabel({ anyOf: [{ type: "integer" }, { type: "null" }] })).toBe("integer | null")
  })

  it("infers enum types from their values", () => {
    expect(generateSchemaExample({ enum: [1, 2] })).toBe(1)
    expect(getSchemaProperties({ properties: { n: { enum: [1, 2] } } })[0]?.schema.type).toBe("integer")
  })

  it("rejects Swagger 2.0 with a helpful message and accepts OpenAPI 3.2", () => {
    const swagger = validateOpenAPI({ swagger: "2.0", info: { title: "x", version: "1" } })
    expect(swagger.errors[0]?.message).toMatch(/Swagger 2.0/)
    expect(validateOpenAPI({ ...base, openapi: "3.2.0" }).valid).toBe(true)
  })

  it("escapes JSON pointer segments in validation paths", () => {
    const result = validateOpenAPI({ ...base, paths: { "/a/{id}": { get: "nope" } } })
    expect(result.errors[0]?.path).toBe("/paths/~1a~1{id}/get")
  })

  it("never throws on non-object documents when validation is off", async () => {
    await expect(parseOpenAPI({ source: "[1, 2]", validate: false })).rejects.toBeInstanceOf(OpenAPIError)
  })
})

describe("server URLs and code samples", () => {
  it("fills server variables and encodes unsafe values", () => {
    const server = {
      url: "https://{region}.example.com/{base}",
      variables: { region: { name: "region", default: "eu" }, base: { name: "base", default: "v1" } },
    }
    expect(getServerUrl(server)).toBe("https://eu.example.com/v1")
    expect(getServerUrl(server, { region: "evil.com#", base: "v2" })).toBe("https://evil.com%23.example.com/v2")
  })

  it("builds request samples with shell-safe curl output", async () => {
    const api = await parseOpenAPI({
      source: spec({
        servers: [{ url: "https://api.example.com" }],
        components: { securitySchemes: { Key: { type: "apiKey", in: "header", name: "X-API-Key" } } },
        security: [{ Key: [] }],
        paths: {
          "/pets/{id}": {
            post: {
              parameters: [
                { name: "id", in: "path", example: "a/b c" },
                { name: "q", in: "query", required: true, example: "it's; rm -rf /" },
                { name: "X-Evil", in: "header", example: "a\r\nInjected: yes" },
              ],
              requestBody: {
                content: { "application/json": { example: JSON.parse(`{"name": "O'Brien", "__proto__": {"x": 1}}`) } },
              },
              responses: {},
            },
          },
        },
      }),
    })

    const operation = api.operations[0]!
    const sample = createRequestSample(operation, { securitySchemes: api.securitySchemes })
    expect(sample.url).toBe("https://api.example.com/pets/a%2Fb%20c?q=it%27s%3B+rm+-rf+%2F")
    expect(sample.headers).toContainEqual(["X-API-Key", "<X_API_KEY>"])
    expect(sample.headers.find(([name]) => name === "X-Evil")?.[1]).not.toMatch(/[\r\n]/)

    const curl = createCodeSample(sample, "curl")
    // Every single quote inside a quoted argument is closed, escaped and reopened.
    expect(curl).toContain(`'\\''`)
    expect(curl).not.toMatch(/Injected: yes'\s*\n/)

    const js = createCodeSample(sample, "javascript")
    expect(js).toContain('body: "{')
    const python = createCodeSample(sample, "python")
    expect(python).toContain('"name": "O\'Brien"')
  })
})

describe("createOpenAPI", () => {
  it("parses once, caches and exposes helpers", async () => {
    let calls = 0
    const fakeFetch = (async () => {
      calls += 1
      return new Response(JSON.stringify(spec({ paths: { "/a": { get: { operationId: "a", responses: {} } } } })))
    }) as unknown as typeof fetch

    const openapi = createOpenAPI({ source: "https://example.com/openapi.json", fetch: fakeFetch })
    const [first, second] = await Promise.all([openapi.parse(), openapi.parse()])
    expect(first).toBe(second)
    expect(calls).toBe(1)
    expect(await openapi.getPagePaths()).toEqual(["/a"])
    expect((await openapi.getOperation("a"))?.path).toBe("/a")
    expect((await openapi.getNavigation())[0]?.items[0]?.href).toBe("#a")

    openapi.reload()
    await openapi.parse()
    expect(calls).toBe(2)
  })

  it("does not cache failures", async () => {
    let fail = true
    const fakeFetch = (async () =>
      fail ? new Response("", { status: 503 }) : new Response(JSON.stringify(spec({ paths: {} })))) as unknown as typeof fetch
    const openapi = createOpenAPI({ source: "https://example.com/openapi.json", fetch: fakeFetch })
    await expect(openapi.parse()).rejects.toThrow(/503/)
    fail = false
    await expect(openapi.parse()).resolves.toMatchObject({ type: "openapi" })
  })
})
