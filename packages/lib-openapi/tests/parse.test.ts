import { describe, expect, it } from "vitest"
import { openapi, OpenAPIParseError } from "../src/index.js"
import planets from "./fixtures/planets.json"

describe("openapi.parse", () => {
  it("parses a JSON document into the normalized model", async () => {
    const api = await openapi.parse(planets)

    expect(api.type).toBe("openapi")
    expect(api.version).toBe("3.1.0")
    expect(api.info.title).toBe("Planets API")
    expect(api.info.version).toBe("1.0.0")
    expect(api.info.license?.name).toBe("MIT")
    expect(api.externalDocs?.url).toBe("https://docs.example.com")
  })

  it("flattens paths into operations", async () => {
    const api = await openapi.parse(planets)

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
    const api = await openapi.parse(planets)

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
    const api = await openapi.parse(planets)

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
    const api = await openapi.parse(planets)

    const listPlanets = api.operations.find((op) => op.id === "listPlanets")
    const responses = listPlanets?.responses ?? []

    expect(responses.map((r) => r.status)).toEqual(["200", "404", "default"])
    expect(responses.find((r) => r.status === "200")?.isSuccess).toBe(true)
    expect(responses.find((r) => r.status === "404")?.isError).toBe(true)
    expect(responses.find((r) => r.status === "default")?.isDefault).toBe(true)
  })

  it("normalizes request bodies with a preferred content type", async () => {
    const api = await openapi.parse(planets)

    const createPlanet = api.operations.find((op) => op.path === "/planets" && op.method === "POST")
    expect(createPlanet?.requestBody?.required).toBe(true)
    expect(createPlanet?.requestBody?.preferredContentType).toBe("application/json")
    expect(createPlanet?.requestBody?.content[0]?.example).toEqual({ name: "Mars" })
  })

  it("resolves operation security and falls back to global security", async () => {
    const api = await openapi.parse(planets)

    const listPlanets = api.operations.find((op) => op.id === "listPlanets")
    expect(listPlanets?.security[0]?.schemes[0]?.name).toBe("ApiKeyAuth")

    const createPlanet = api.operations.find((op) => op.path === "/planets" && op.method === "POST")
    expect(createPlanet?.security[0]?.schemes[0]?.name).toBe("BearerAuth")
  })

  it("normalizes security schemes", async () => {
    const api = await openapi.parse(planets)

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

  it("groups operations by tag, with untagged operations in a default group", async () => {
    const api = await openapi.parse(planets)

    const groupNames = api.groups.map((g) => g.name)
    expect(groupNames).toEqual(["planets", "moons"])
    expect(api.groups.find((g) => g.name === "planets")?.operations).toHaveLength(3)
    expect(api.groups.find((g) => g.name === "moons")?.operations).toHaveLength(1)
    expect(api.tags.find((t) => t.name === "planets")?.description).toBe(
      "Everything about planets"
    )
  })

  it("normalizes servers with variables", async () => {
    const api = await openapi.parse(planets)

    expect(api.servers).toHaveLength(1)
    expect(api.servers[0]?.url).toBe("https://api.example.com/v1")
    expect(api.servers[0]?.variables.version?.default).toBe("v1")
    expect(api.servers[0]?.variables.version?.enum).toEqual(["v1", "v2"])
  })

  it("normalizes webhooks (OpenAPI 3.1)", async () => {
    const api = await openapi.parse(planets)

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
    const fromText = await openapi.parse(yamlText)
    expect(fromText.info.title).toBe("Inline YAML")
    expect(fromText.operations[0]?.id).toBe("get-ping")

    const fromFile = await openapi.parse(new URL("./fixtures/moons.yaml", import.meta.url).pathname)
    expect(fromFile.info.title).toBe("Moons API")
    expect(fromFile.schemas["Moon"]?.properties?.name?.type).toBe("string")
  })

  it("throws OpenAPIParseError for invalid documents", async () => {
    await expect(openapi.parse({ hello: "world" })).rejects.toBeInstanceOf(OpenAPIParseError)

    await expect(
      openapi.parse({ openapi: "4.0.0", info: { title: "x", version: "1" } })
    ).rejects.toThrow(/Unsupported OpenAPI version/)
  })

  it("skips validation when validate: false", async () => {
    const api = await openapi.parse({ hello: "world" }, { validate: false })
    expect(api.info.title).toBe("Untitled API")
  })

  it("keeps the raw document when includeRaw: true", async () => {
    const api = await openapi.parse(planets, { includeRaw: true })
    expect(api.raw).toBeDefined()
    expect(api.raw?.openapi).toBe("3.1.0")
  })
})

describe("openapi.validate / navigation / search", () => {
  it("validates without parsing", async () => {
    const result = await openapi.validate(planets)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])

    const invalid = await openapi.validate({ openapi: "3.1.0" })
    expect(invalid.valid).toBe(false)
    expect(invalid.errors.some((e) => e.path === "/info")).toBe(true)
  })

  it("builds navigation from groups", async () => {
    const api = await openapi.parse(planets)
    const nav = openapi.navigation(api)

    expect(nav.groups.map((g) => g.title)).toEqual(["planets", "moons"])
    expect(nav.groups[0]?.items[0]).toMatchObject({
      id: "listPlanets",
      method: "GET",
      path: "/planets",
    })
  })

  it("searches operations, schemas and tags", async () => {
    const api = await openapi.parse(planets)

    const results = openapi.search(api, "planet")
    expect(results.some((r) => r.type === "operation" && r.id === "listPlanets")).toBe(true)
    expect(results.some((r) => r.type === "schema" && r.id === "Planet")).toBe(true)
    expect(results.some((r) => r.type === "tag" && r.id === "planets")).toBe(true)
  })
})
