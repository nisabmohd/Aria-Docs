import { describe, expect, it } from "vitest"
import { dereference, parseOpenAPI, resolveRefs } from "../src/index.js"
import {
  generateSchemaExample,
  getSchemaProperties,
  getSchemaType,
  isNullableSchema,
  resolveSchema,
} from "../src/normalize/schema.js"
import { getErrorResponses, getPrimaryResponse, getSuccessResponses } from "../src/utils/responses.js"
import planets from "./fixtures/planets.json"

describe("ref resolution", () => {
  it("resolves local refs and keeps the origin pointer", () => {
    const { document, warnings } = resolveRefs(planets)

    expect(warnings).toEqual([])

    const schema = (
      (document.paths as Record<string, unknown>)["/planets"] as Record<string, unknown>
    ) as Record<string, unknown>
    const get = schema.get as Record<string, unknown>
    const responses = get.responses as Record<string, unknown>
    const ok = responses["200"] as Record<string, unknown>
    const content = ok.content as Record<string, unknown>
    const json = content["application/json"] as Record<string, unknown>
    const resolved = json.schema as Record<string, unknown>

    // $ref -> resolved content + ref marker
    expect(resolved.ref).toBe("#/components/schemas/Planets")
    expect(resolved.type).toBe("array")
  })

  it("leaves recursive refs finite instead of expanding forever", () => {
    const { document } = resolveRefs(planets)

    const components = document.components as Record<string, unknown>
    const schemas = components.schemas as Record<string, unknown>
    const user = schemas.User as Record<string, unknown>
    const properties = user.properties as Record<string, unknown>
    const friend = properties.friend as Record<string, unknown>

    // The recursive reference is kept as a raw $ref object.
    expect(friend.$ref).toBe("#/components/schemas/User")
  })

  it("reports external refs as warnings and leaves them as-is", () => {
    const spec = {
      openapi: "3.1.0",
      info: { title: "External", version: "1.0.0" },
      paths: {
        "/x": {
          get: {
            responses: {
              "200": {
                description: "ok",
                content: {
                  "application/json": {
                    schema: { $ref: "https://example.com/common.yaml#/Thing" },
                  },
                },
              },
            },
          },
        },
      },
    }

    const { document, warnings } = resolveRefs(spec)
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain("External $ref")

    const paths = document.paths as Record<string, unknown>
    const x = paths["/x"] as Record<string, unknown>
    const get = x.get as Record<string, unknown>
    const responses = get.responses as Record<string, unknown>
    const ok = responses["200"] as Record<string, unknown>
    const content = ok.content as Record<string, unknown>
    const json = content["application/json"] as Record<string, unknown>
    expect(json.schema).toEqual({ $ref: "https://example.com/common.yaml#/Thing" })
  })

  it("dereference strips ref markers but still protects cycles", () => {
    const { document } = dereference(planets)

    const components = document.components as Record<string, unknown>
    const schemas = components.schemas as Record<string, unknown>
    const planetsSchema = schemas.Planets as Record<string, unknown>
    const items = planetsSchema.items as Record<string, unknown>

    expect(items.ref).toBeUndefined()
    expect(items.type).toBe("object")
    expect(items.required).toEqual(["id", "name"])

    const user = schemas.User as Record<string, unknown>
    const friend = (user.properties as Record<string, unknown>).friend as Record<string, unknown>
    expect(friend.$ref).toBe("#/components/schemas/User")
  })

  it("strict mode throws on unresolved refs", async () => {
    const spec = {
      openapi: "3.1.0",
      info: { title: "External", version: "1.0.0" },
      paths: {
        "/x": {
          get: {
            responses: {
              "200": {
                description: "ok",
                content: {
                  "application/json": { schema: { $ref: "https://x.dev/a.yaml#/A" } },
                },
              },
            },
          },
        },
      },
    }

    await expect(parseOpenAPI({ source: spec, strict: true })).rejects.toThrow(/Strict mode/)
  })
})

describe("schema utilities", () => {
  it("generates examples from schema shapes", () => {
    expect(generateSchemaExample({ type: "string" })).toBe("string")
    expect(generateSchemaExample({ type: "string", format: "email" })).toBe("user@example.com")
    expect(generateSchemaExample({ type: "integer" })).toBe(0)
    expect(generateSchemaExample({ type: "boolean" })).toBe(true)
    expect(generateSchemaExample({ type: "array", items: { type: "string" } })).toEqual(["string"])
    expect(generateSchemaExample({ enum: ["a", "b"] })).toBe("a")
    expect(
      generateSchemaExample({
        type: "object",
        properties: { id: { type: "integer" }, name: { type: "string" } },
      })
    ).toEqual({ id: 0, name: "string" })
  })

  it("exposes first-class schema properties", () => {
    const api = planets as unknown as {
      components: { schemas: Record<string, Record<string, unknown>> }
    }
    const planet = api.components.schemas["Planet"] as never
    const properties = getSchemaProperties(planet)

    expect(properties.map((p) => p.name)).toEqual(["id", "name", "gravity", "tags", "status"])
    expect(properties.find((p) => p.name === "id")?.required).toBe(true)
    expect(properties.find((p) => p.name === "id")?.readOnly).toBe(true)
    expect(properties.find((p) => p.name === "gravity")?.required).toBe(false)
  })

  it("infers missing types and detects nullability", () => {
    expect(getSchemaType({ properties: { a: { type: "string" } } })).toBe("object")
    expect(getSchemaType({ items: { type: "string" } })).toBe("array")
    expect(isNullableSchema({ type: ["string", "null"] })).toBe(true)
    expect(isNullableSchema({ type: "string", nullable: true })).toBe(true)
  })

  it("resolves a schema's ref marker into the schemas record", async () => {
    const api = await parseOpenAPI({ source: planets })
    const listPlanets = api.operations.find((op) => op.id === "listPlanets")
    const response = listPlanets?.responses.find((r) => r.status === "200")
    const content = response?.content[0]

    expect(content?.schema?.ref).toBe("#/components/schemas/Planets")

    if (content?.schema !== undefined) {
      const resolved = resolveSchema(content.schema, api.schemas)
      expect(resolved.type).toBe("array")
    }
  })
})

describe("response helpers", () => {
  it("picks the primary, success and error responses", async () => {
    const api = await parseOpenAPI({ source: planets })
    const listPlanets = api.operations.find((op) => op.id === "listPlanets")
    if (listPlanets === undefined) throw new Error("missing operation")

    expect(getPrimaryResponse(listPlanets)?.status).toBe("200")
    expect(getSuccessResponses(listPlanets).map((r) => r.status)).toEqual(["200"])
    expect(getErrorResponses(listPlanets).map((r) => r.status)).toEqual(["404"])
  })
})
