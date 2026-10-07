import { describe, expect, it } from "vitest"
import {
  createIdGenerator,
  getOwn,
  sanitizeUrl,
  setOwn,
  slugify,
  slugToTitle,
  truncate,
} from "../src/index.js"

describe("sanitizeUrl", () => {
  it("keeps safe absolute, relative and fragment URLs", () => {
    expect(sanitizeUrl("https://example.com/a?b=c")).toBe("https://example.com/a?b=c")
    expect(sanitizeUrl("mailto:me@example.com")).toBe("mailto:me@example.com")
    expect(sanitizeUrl("/docs/intro")).toBe("/docs/intro")
    expect(sanitizeUrl("#section")).toBe("#section")
    expect(sanitizeUrl("docs/intro")).toBe("docs/intro")
  })

  it("rejects script-capable and obfuscated schemes", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBeUndefined()
    expect(sanitizeUrl(" JaVaScRiPt:alert(1)")).toBeUndefined()
    expect(sanitizeUrl("java\tscript:alert(1)")).toBeUndefined()
    expect(sanitizeUrl("java\u0000script:alert(1)")).toBeUndefined()
    expect(sanitizeUrl("data:text/html;base64,PHNjcmlwdD4=")).toBeUndefined()
    expect(sanitizeUrl("vbscript:msgbox")).toBeUndefined()
    expect(sanitizeUrl("//evil.example.com")).toBeUndefined()
    expect(sanitizeUrl("")).toBeUndefined()
    expect(sanitizeUrl(42)).toBeUndefined()
  })
})

describe("safe objects", () => {
  it("setOwn stores __proto__ as a plain key without touching the prototype", () => {
    const record: Record<string, unknown> = {}
    setOwn(record, "__proto__", { polluted: true })
    expect(Object.getPrototypeOf(record)).toBe(Object.prototype)
    expect(Object.keys(record)).toEqual(["__proto__"])
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })

  it("getOwn ignores inherited members", () => {
    const record: Record<string, string> = { a: "1" }
    expect(getOwn(record, "a")).toBe("1")
    expect(getOwn(record, "constructor")).toBeUndefined()
    expect(getOwn(record, "toString")).toBeUndefined()
    expect(getOwn(record, "__proto__")).toBeUndefined()
  })
})

describe("text helpers", () => {
  it("slugifies with a fallback", () => {
    expect(slugify("Pets & Owners")).toBe("pets-owners")
    expect(slugify("Café Crème")).toBe("cafe-creme")
    expect(slugify("🚀", "tag")).toBe("tag")
  })

  it("converts slugs to titles", () => {
    expect(slugToTitle("getting-started")).toBe("Getting Started")
    expect(slugToTitle("api_reference")).toBe("Api Reference")
  })

  it("generates unique ids", () => {
    const unique = createIdGenerator()
    expect(["a", "a", "a-2", "a", "b"].map(unique)).toEqual(["a", "a-2", "a-2-2", "a-3", "b"])
  })

  it("truncates long values to one line", () => {
    expect(truncate("a\nb", 10)).toBe("a b")
    expect(truncate("x".repeat(20), 10)).toHaveLength(10)
  })
})
