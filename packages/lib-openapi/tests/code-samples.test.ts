import { describe, expect, it } from "vitest"
import { CODE_SAMPLE_LANGUAGES, createCodeSample, type APIRequestSample } from "../src/index.js"

// Characters that break naive string building in at least one language.
const tricky = 'Hi "there" $name ${x} `tick` """ \\ end \\u0041 é # "#'
const body = { subject: tricky, lines: ["a", "b\nc"] }
const expected = JSON.stringify(body, null, 2)

const json: APIRequestSample = {
  method: "POST",
  url: "https://api.example.com/emails?q=it%27s",
  headers: [
    ["Authorization", "Bearer <TOKEN>"],
    ["X-Note", 'price $5 "quoted"'],
    ["Content-Type", "application/json"],
  ],
  contentType: "application/json",
  body,
}

/** Undo C-style escapes as Go, Java and C# compilers would. */
function unescapeC(literal: string): string {
  return JSON.parse(literal) as string
}

describe("code samples", () => {
  it("generates every language", () => {
    for (const language of CODE_SAMPLE_LANGUAGES) {
      const code = createCodeSample(json, language.id)
      expect(code.length, language.id).toBeGreaterThan(50)
      expect(code, language.id).toContain("api.example.com/emails")
    }
  })

  it("Go: the raw string or quoted literal holds the exact body", () => {
    const code = createCodeSample(json, "go")
    const literal = /strings\.NewReader\(([\s\S]*)\)\n\n\treq/.exec(code)?.[1] ?? ""
    // The body contains a backtick, so Go falls back to an escaped literal.
    expect(literal.startsWith('"')).toBe(true)
    expect(unescapeC(literal)).toBe(expected)
    expect(code).toContain('req.Header.Set("X-Note", "price $5 \\"quoted\\"")')

    const plain = createCodeSample({ ...json, body: { a: 1 } }, "go")
    expect(plain).toContain("strings.NewReader(`{\n  \"a\": 1\n}`)")
  })

  it("Rust: a raw string with enough hashes, and \\u{} escapes elsewhere", () => {
    const code = createCodeSample(json, "rust")
    const match = /\.body\(r(#+)"([\s\S]*?)"\1\)/.exec(code)
    expect(match?.[1]).toBe("##") // the body contains `"#`, so one hash isn't enough
    expect(match?.[2]).toBe(expected)
    expect(code).toContain('.header("X-Note", "price $5 \\"quoted\\"")')

    const withControl = createCodeSample({ ...json, headers: [["X-Bell", "a\u0007b"]] }, "rust")
    expect(withControl).toContain('"a\\u{7}b"')
  })

  it("Kotlin: `$` can't start a template, in raw and escaped strings", () => {
    const code = createCodeSample({ ...json, body: { subject: "pay $5 ${total}" } }, "kotlin")
    const raw = /val body = """\n([\s\S]*?)\n {4}"""\.trimIndent\(\)/.exec(code)?.[1] ?? ""
    const decoded = raw
      .split("\n")
      .map((line) => line.slice(4))
      .join("\n")
      .replace(/\$\{'\$'\}/g, "$")
    expect(decoded).toBe(JSON.stringify({ subject: "pay $5 ${total}" }, null, 2))
    expect(raw.replace(/\$\{'\$'\}/g, "")).not.toContain("$")
    expect(code).toContain('.addHeader("X-Note", "price \\$5 \\"quoted\\"")')

    // A body containing """ can't use a raw string; it falls back to an escaped one.
    const fallback = createCodeSample({ ...json, contentType: "text/plain", body: 'say """ $x' }, "kotlin")
    expect(fallback).toContain('val body = "say \\"\\"\\" \\$x"')
  })

  it("Java: a text block whose content is the exact body", () => {
    const code = createCodeSample(json, "java")
    const block = /String body = """\n([\s\S]*?)""";/.exec(code)?.[1] ?? ""
    const lines = block.split("\n")
    const indentation = Math.min(...lines.filter((line) => line.trim() !== "").map((line) => /^ */.exec(line)?.[0].length ?? 0))
    const decoded = lines
      .map((line) => line.slice(indentation))
      .join("\n")
      .replace(/\\(["\\])/g, "$1")
    expect(decoded).toBe(expected)
  })

  it("C#: a raw string with more quotes than the body contains", () => {
    const code = createCodeSample(json, "csharp")
    const match = /var body = ("{3,})\n([\s\S]*?)\n\1;/.exec(code)
    expect(match?.[1]).toBe('"""') // JSON escapes its quotes, so three are enough
    expect(match?.[2]).toBe(expected)

    const text = 'say """" loudly'
    const plain = createCodeSample({ ...json, contentType: "text/plain", body: text }, "csharp")
    const plainMatch = /var body = ("{3,})\n([\s\S]*?)\n\1;/.exec(plain)
    expect(plainMatch?.[1]).toBe('"""""') // a run of four quotes needs five
    expect(plainMatch?.[2]).toBe(text)
    // C# sets Content-Type on the content, not on the request headers.
    expect(code).not.toContain('TryAddWithoutValidation("Content-Type"')
    expect(code).toContain('new StringContent(body, Encoding.UTF8, "application/json")')
  })

  it("handles GET without a body and multipart forms", () => {
    const get: APIRequestSample = { method: "GET", url: "https://x.dev/a", headers: [] }
    expect(createCodeSample(get, "go")).toContain('http.NewRequest("GET", "https://x.dev/a", nil)')
    expect(createCodeSample(get, "kotlin")).toContain('.method("GET", null)')
    expect(createCodeSample(get, "java")).toContain("BodyPublishers.noBody()")

    const multipart: APIRequestSample = {
      method: "POST",
      url: "https://x.dev/upload",
      headers: [],
      contentType: "multipart/form-data",
      multipart: true,
      body: { name: 'a"b' },
    }
    expect(createCodeSample(multipart, "go")).toContain('writer.WriteField("name", "a\\"b")')
    expect(createCodeSample(multipart, "rust")).toContain('.text("name", "a\\"b")')
    expect(createCodeSample(multipart, "kotlin")).toContain('.addFormDataPart("name", "a\\"b")')
    expect(createCodeSample(multipart, "csharp")).toContain('form.Add(new StringContent("a\\"b"), "name");')
  })
})
