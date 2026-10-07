import { describe, expect, it } from "vitest"
import {
  getNavigation,
  OpenAPIError,
  parseOpenAPI,
  search,
  validateOpenAPI,
} from "../src/index.js"
import planets from "./fixtures/planets.json"

describe("parseOpenAPI", () => {
  it("parses a JSON document into the normalized model", async () => {
    const api = await parseOpenAPI({ source: planets })

    expect(api.type).toBe("openapi")
    expect(api.version).toBe("3.1.0")
    expect(api.info.title).toBe("Planets API")
    expect(api.info.version).toBe("1.0.0")
    expect(api.info.license?.name).toBe("MIT")
    expect(api.externalDocs?.url).toBe("https://docs.example.com")
  })

  it("flattens paths into operations", async () => {
    const api = await parseOpenAPI({ source: planets })

    expect(api.operations).toHaveLength(4)
    expect(api.paths["/planets"]).toHaveLength(2)
    expect(api.paths["/planets/{id}"]).toHaveLength(1)

    const listPlanets = api.operations.find((op) => op.id === "listPlanets")
    expect(listPlanets?.method).toBe("GET")
    expect(listPlanets?.path).toBe("/planets")
    expect(listPlanets?.summary).toBe("List all planets")
    expect(listPlanets?.tags).toContain("planets")
  })

  it("generates stable ids when operationId is missing", async () => {
    const api = await parseOpenAPI({ source: planets })

    const getPlanet = api.operations.find(
      (op) => op.method === "GET" && op.path === "/planets/{id}"
    )
    expect(getPlanet?.id).toBe("get-planets-id")

    const listMoons = api.operations.find(
      (op) => op.method === "GET" && op.path === "/moons"
    )
    expect(listMoons?.id).toBe("get-moons")
  })

  it("merges path-level and operation-level parameters with operation overrides", async () => {
    const api = await parseOpenAPI({ source: planets })

    const listPlanets = api.operations.find((op) => op.id === "listPlanets")
    expect(listPlanets?.parameters).toHaveLength(2)

    const header = listPlanets?.parameters.find((p) => p.name === "X-Request-Id")
    expect(header?.in).toBe("header")
    // Operation-level parameter (uuid format) wins over the path-level one.
    expect(header?.schema?.format).toBe("uuid")

    expect(listPlanets?.parametersByLocation.query.map((p) => p.name)).toEqual(["limit"])
    expect(listPlanets?.parametersByLocation.header.map((p) => p.name)).toEqual(["X-Request-Id"])
    expect(listPlanets?.parametersByLocation.path).toEqual([])
  })

  it("computes response status flags and sorts responses", async () => {
    const api = await parseOpenAPI({ source: planets })

    const listPlanets = api.operations.find((op) => op.id === "listPlanets")
    const responses = listPlanets?.responses ?? []

    expect(responses.map((r) => r.status)).toEqual(["200", "404", "default"])
    expect(responses.find((r) => r.status === "200")?.isSuccess).toBe(true)
    expect(responses.find((r) => r.status === "404")?.isError).toBe(true)
    expect(responses.find((r) => r.status === "default")?.isDefault).toBe(true)
  })

  it("normalizes request bodies with a preferred content type", async () => {
    const api = await parseOpenAPI({ source: planets })

    const createPlanet = api.operations.find((op) => op.path === "/planets" && op.method === "POST")
    expect(createPlanet?.requestBody?.required).toBe(true)
    expect(createPlanet?.requestBody?.preferredContentType).toBe("application/json")
    expect(createPlanet?.requestBody?.content[0]?.example).toEqual({ name: "Mars" })
  })

  it("resolves operation security and falls back to global security", async () => {
    const api = await parseOpenAPI({ source: planets })

    const listPlanets = api.operations.find((op) => op.id === "listPlanets")
    expect(listPlanets?.security[0]?.schemes[0]?.name).toBe("ApiKeyAuth")

    const createPlanet = api.operations.find((op) => op.path === "/planets" && op.method === "POST")
    expect(createPlanet?.security[0]?.schemes[0]?.name).toBe("BearerAuth")
  })

  it("normalizes security schemes", async () => {
    const api = await parseOpenAPI({ source: planets })

    expect(api.securitySchemes["ApiKeyAuth"]).toMatchObject({
      type: "apiKey",
      in: "header",
      name: "X-API-Key",
    })
    expect(api.securitySchemes["BearerAuth"]).toMatchObject({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    })
    expect(
      api.securitySchemes["OAuth"]?.flows?.authorizationCode?.scopes?.["read:planets"]
    ).toBe("Read planets")
  })

  it("groups operations by tag in declared order", async () => {
    const api = await parseOpenAPI({ source: planets })

    expect(api.tags.map((t) => t.name)).toEqual(["planets", "moons"])
    expect(api.tags.find((t) => t.name === "planets")?.operations).toHaveLength(3)
    expect(api.tags.find((t) => t.name === "moons")?.operations).toHaveLength(1)
    expect(api.tags.find((t) => t.name === "planets")?.description).toBe(
      "Everything about planets"
    )
  })

  it("normalizes servers with variables", async () => {
    const api = await parseOpenAPI({ source: planets })

    expect(api.servers).toHaveLength(1)
    expect(api.servers[0]?.url).toBe("https://api.example.com/v1")
    expect(api.servers[0]?.variables.version?.default).toBe("v1")
    expect(api.servers[0]?.variables.version?.enum).toEqual(["v1", "v2"])
  })

  it("normalizes webhooks (OpenAPI 3.1)", async () => {
    const api = await parseOpenAPI({ source: planets })

    expect(api.webhooks).toHaveLength(1)
    expect(api.webhooks[0]?.name).toBe("newPlanet")
    expect(api.webhooks[0]?.operations[0]?.summary).toBe("A new planet was discovered")
  })

  it("parses YAML strings and file paths", async () => {
    const yamlText = `
openapi: 3.0.3
info:
  title: Inline YAML
  version: 1.0.0
paths:
  /ping:
    get:
      responses:
        "200":
          description: pong
`
    const fromText = await parseOpenAPI({ source: yamlText })
    expect(fromText.info.title).toBe("Inline YAML")
    expect(fromText.operations[0]?.id).toBe("get-ping")

    const fromFile = await parseOpenAPI({ source: new URL("./fixtures/moons.yaml", import.meta.url).pathname })
    expect(fromFile.info.title).toBe("Moons API")
    expect(fromFile.schemas["Moon"]?.properties?.name?.type).toBe("string")
  })

  it("throws OpenAPIError for invalid documents", async () => {
    await expect(parseOpenAPI({ source: { hello: "world" } })).rejects.toBeInstanceOf(OpenAPIError)

    await expect(
      parseOpenAPI({ source: { openapi: "4.0.0", info: { title: "x", version: "1" } } })
    ).rejects.toThrow(/Unsupported OpenAPI version/)
  })

  it("skips validation when validate: false", async () => {
    const api = await parseOpenAPI({ source: { hello: "world" }, validate: false })
    expect(api.info.title).toBe("Untitled API")
  })

  it("keeps the raw document when includeRaw: true", async () => {
    const api = await parseOpenAPI({ source: planets, includeRaw: true })
    expect(api.raw).toBeDefined()
    expect(api.raw?.openapi).toBe("3.1.0")
  })
})

describe("validateOpenAPI / getNavigation / search", () => {
  it("validates without parsing", async () => {
    const result = validateOpenAPI(planets)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])

    const invalid = validateOpenAPI({ openapi: "3.1.0" })
    expect(invalid.valid).toBe(false)
    expect(invalid.errors.some((e) => e.path === "/info")).toBe(true)
  })

  it("builds NavItem navigation from tags", async () => {
    const api = await parseOpenAPI({ source: planets })
    const nav = getNavigation(api)

    expect(nav.map((g) => g.title)).toEqual(["planets", "moons"])
    expect(nav[0]?.items[0]).toMatchObject({
      title: "List all planets",
      href: "#listPlanets",
      badge: "GET",
      nav: true,
      items: [],
    })

    const routed = getNavigation(api, { getOperationHref: (op) => `/api/${op.id}` })
    expect(routed[0]?.items[0]?.href).toBe("/api/listPlanets")
  })

  it("searches operations, schemas and tags", async () => {
    const api = await parseOpenAPI({ source: planets })

    const results = search(api, "planet")
    expect(results.some((r) => r.type === "operation" && r.id === "listPlanets")).toBe(true)
    expect(results.some((r) => r.type === "schema" && r.id === "Planet")).toBe(true)
    expect(results.some((r) => r.type === "tag" && r.id === "planets")).toBe(true)
    expect(search(api, "list planets").map((r) => r.id)).toContain("listPlanets")
    expect(search(api, "   ")).toEqual([])
  })
})
