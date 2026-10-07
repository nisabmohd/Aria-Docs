import { describe, expect, it } from "vitest"
import {
  CODE_SAMPLE_LANGUAGES,
  createCodeSample,
  createRequestSample,
  getSchemaProperties,
  getSchemaTypeLabel,
  getServerUrl,
  parseOpenAPI,
} from "../src/index.js"

const source = new URL("./fixtures/edge-cases.yaml", import.meta.url).pathname

describe("edge-case fixture", () => {
  it("parses every part without warnings", async () => {
    const api = await parseOpenAPI({ source })
    const operation = api.operations[0]!

    expect(api.warnings).toEqual([])
    expect(operation.id).toBe("items-create")
    expect(api.tags[0]?.title).toBe("Items")
    expect(getServerUrl(api.servers[0]!)).toBe("https://eu.api.example.com/v2")

    expect(operation.parameters.map((p) => `${p.in}:${p.name}`)).toEqual([
      "path:project_id",
      "query:dry_run",
      "query:fields",
      "query:priority",
      "query:legacy_mode",
      "header:Idempotency-Key",
      "cookie:session",
    ])
    expect(operation.parametersByLocation.query.find((p) => p.name === "fields")?.explode).toBe(false)
    expect(operation.parametersByLocation.query.find((p) => p.name === "legacy_mode")?.deprecated).toBe(true)

    // Bearer, or API key + OAuth scopes, or no auth.
    expect(operation.security.map((r) => r.schemes.map((s) => s.name))).toEqual([["bearerAuth"], ["apiKey", "oauth"], []])

    expect(operation.requestBody?.content.map((c) => c.mediaType)).toEqual([
      "application/json",
      "multipart/form-data",
      "application/x-www-form-urlencoded",
    ])
    expect(operation.responses.map((r) => r.status)).toEqual([
      "201", "202", "204", "303", "400", "401", "409", "422", "429", "5XX", "default",
    ])
  })

  it("labels composed, nullable and recursive fields", async () => {
    const api = await parseOpenAPI({ source })
    const schema = api.operations[0]!.requestBody!.content[0]!.schema!
    const labels = Object.fromEntries(getSchemaProperties(schema).map((p) => [p.name, getSchemaTypeLabel(p.schema)]))

    expect(labels).toMatchObject({
      id: "string<uuid>",
      tags: "string[]",
      content: "Note | Task",
      owner: "object | null",
      outline: "Node",
      secret: "string<password>",
    })

    const outline = getSchemaProperties(schema).find((p) => p.name === "outline")!.schema
    const children = getSchemaProperties(outline).find((p) => p.name === "children")!.schema
    // The recursive reference stays a $ref instead of expanding forever.
    expect(getSchemaTypeLabel(children)).toBe("Node[]")
  })

  it("generates a sample in every language", async () => {
    const api = await parseOpenAPI({ source })
    const sample = createRequestSample(api.operations[0]!, { securitySchemes: api.securitySchemes })
    expect(sample.url).toBe("https://eu.api.example.com/v2/projects/prj_8f2k1m9x0a3b/items?dry_run=false&fields=id%2Ctitle&priority=3")
    for (const language of CODE_SAMPLE_LANGUAGES) {
      expect(createCodeSample(sample, language.id)).toContain("prj_8f2k1m9x0a3b")
    }
  })
})

describe("serializable output", () => {
  // Loaders in TanStack Start, React Router and the Next.js Pages Router send
  // the parsed spec to the browser, so it must survive a JSON round trip.
  it("round-trips through JSON unchanged, raw documents included", async () => {
    const api = await parseOpenAPI({ source, includeRaw: true })
    expect(JSON.parse(JSON.stringify(api))).toEqual(api)
    expect(structuredClone(api)).toEqual(api)
  })
})
