import { isRecord } from "@ariadocs/core"
import { stringifyValue as stringify, type APIRequestSample } from "./request-sample.js"

export type CodeSampleLanguage =
  | "curl"
  | "javascript"
  | "python"
  | "go"
  | "rust"
  | "java"
  | "kotlin"
  | "csharp"

export const CODE_SAMPLE_LANGUAGES: { id: CodeSampleLanguage; label: string; syntax: string }[] = [
  { id: "curl", label: "cURL", syntax: "bash" },
  { id: "javascript", label: "JavaScript", syntax: "javascript" },
  { id: "python", label: "Python", syntax: "python" },
  { id: "go", label: "Go", syntax: "go" },
  { id: "rust", label: "Rust", syntax: "rust" },
  { id: "java", label: "Java", syntax: "java" },
  { id: "kotlin", label: "Kotlin", syntax: "kotlin" },
  { id: "csharp", label: "C#", syntax: "csharp" },
]

/**
 * Turn a request sample into code. Every value from the document is
 * escaped for the target language, so copied snippets can't run anything
 * the spec author injected.
 *
 * | Language | Client |
 * | --- | --- |
 * | `curl` | cURL |
 * | `javascript` | `fetch` |
 * | `python` | `requests` |
 * | `go` | `net/http` |
 * | `rust` | `reqwest` (blocking) |
 * | `java` | `java.net.http` (Java 15+) |
 * | `kotlin` | OkHttp 4 |
 * | `csharp` | `HttpClient` (C# 11+) |
 */
export function createCodeSample(sample: APIRequestSample, language: CodeSampleLanguage): string {
  switch (language) {
    case "curl":
      return toCurl(sample)
    case "javascript":
      return toJavaScript(sample)
    case "python":
      return toPython(sample)
    case "go":
      return toGo(sample)
    case "rust":
      return toRust(sample)
    case "java":
      return toJava(sample)
    case "kotlin":
      return toKotlin(sample)
    case "csharp":
      return toCSharp(sample)
  }
}

// ---------------------------------------------------------------------------
// Body helpers
// ---------------------------------------------------------------------------

type BodyKind = "none" | "json" | "form" | "multipart" | "text"

function bodyKind(sample: APIRequestSample): BodyKind {
  if (sample.body === undefined) return "none"
  if (sample.multipart) return "multipart"
  const type = sample.contentType ?? ""
  if (/[/+]json\b/i.test(type)) return "json"
  if (/x-www-form-urlencoded/i.test(type) && isRecord(sample.body)) return "form"
  return "text"
}

/** The body as text: pretty JSON, a URL-encoded form, or the raw value. */
function bodyText(sample: APIRequestSample): string | undefined {
  switch (bodyKind(sample)) {
    case "none":
      return undefined
    case "json":
      return JSON.stringify(sample.body, null, 2)
    case "form":
      return new URLSearchParams(formFields(sample)).toString()
    default:
      return stringify(sample.body)
  }
}

function formFields(sample: APIRequestSample): [string, string][] {
  return isRecord(sample.body) ? Object.entries(sample.body).map(([k, v]) => [k, stringify(v)]) : []
}

/** Headers, optionally without Content-Type (for clients that set it on the body). */
function headersWithout(sample: APIRequestSample, skipContentType: boolean): [string, string][] {
  return skipContentType
    ? sample.headers.filter(([name]) => name.toLowerCase() !== "content-type")
    : sample.headers
}

function indent(text: string, prefix: string): string {
  return text
    .split("\n")
    .map((line) => (line === "" ? line : prefix + line))
    .join("\n")
}

// ---------------------------------------------------------------------------
// String literals
// ---------------------------------------------------------------------------

/**
 * A double-quoted literal with C-style escapes. JSON's escaping (`\"`, `\\`,
 * `\n`, `\uXXXX`) is valid in JavaScript, Python, Go, Java and C#.
 */
function quoted(value: string): string {
  return JSON.stringify(value)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
    .replace(/<\//g, "<\\/")
}

/** Rust escapes Unicode as `\u{…}`, not `\uXXXX`. */
function rustString(value: string): string {
  let out = '"'
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    if (char === '"') out += '\\"'
    else if (char === "\\") out += "\\\\"
    else if (char === "\n") out += "\\n"
    else if (char === "\r") out += "\\r"
    else if (char === "\t") out += "\\t"
    else if (code < 0x20 || code === 0x7f || code === 0x2028 || code === 0x2029) out += `\\u{${code.toString(16)}}`
    else out += char
  }
  return `${out}"`
}

/** Kotlin strings are templates: `$` must be escaped too. */
function kotlinString(value: string): string {
  return quoted(value).replace(/\$/g, () => "\\$")
}

/** A multi-line body as readable as each language allows, falling back to an escaped literal. */
const multiline = {
  /** Go raw string: anything but a backtick. */
  go(text: string): string {
    return text.includes("`") ? quoted(text) : `\`${text}\``
  },
  /** Rust raw string with enough `#`s that the body can't close it. */
  rust(text: string): string {
    let hashes = "#"
    while (text.includes(`"${hashes}`)) hashes += "#"
    return `r${hashes}"${text}"${hashes}`
  },
  /** Java text block: backslashes and `"""` still need escaping. Closing on the last line adds no newline. */
  java(text: string): string {
    const escaped = text.replace(/\\/g, () => "\\\\").replace(/"""/g, () => '\\"""')
    return `"""\n${escaped}"""`
  },
  /** Kotlin raw string: `$` is replaced by `${'$'}`; `"""` falls back to an escaped literal. */
  kotlin(text: string): string {
    if (text.includes('"""')) return kotlinString(text)
    // A function replacer, because `$'` in a replacement string means "text after the match".
    return `"""\n${text.replace(/\$/g, () => "${'$'}")}\n""".trimIndent()`
  },
  /** C# raw string literal with more quotes than any run in the body. */
  csharp(text: string): string {
    const longest = Math.max(0, ...(text.match(/"+/g) ?? []).map((run) => run.length))
    const quotes = '"'.repeat(Math.max(3, longest + 1))
    return `${quotes}\n${text}\n${quotes}`
  },
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}

// ---------------------------------------------------------------------------
// cURL
// ---------------------------------------------------------------------------

function toCurl(sample: APIRequestSample): string {
  const lines = [`curl${sample.method === "GET" ? "" : ` -X ${sample.method}`} ${shellQuote(sample.url)}`]
  for (const [name, value] of sample.headers) {
    lines.push(`-H ${shellQuote(`${name}: ${value}`)}`)
  }
  if (bodyKind(sample) === "multipart") {
    for (const [name, value] of formFields(sample)) lines.push(`-F ${shellQuote(`${name}=${value}`)}`)
  } else {
    const body = bodyText(sample)
    if (body !== undefined) lines.push(`-d ${shellQuote(body)}`)
  }
  return lines.join(" \\\n  ")
}

// ---------------------------------------------------------------------------
// JavaScript (fetch)
// ---------------------------------------------------------------------------

function toJavaScript(sample: APIRequestSample): string {
  const kind = bodyKind(sample)
  const options: string[] = [`  method: ${quoted(sample.method)},`]

  if (sample.headers.length > 0) {
    options.push("  headers: {")
    for (const [name, value] of sample.headers) options.push(`    ${quoted(name)}: ${quoted(value)},`)
    options.push("  },")
  }

  const prelude: string[] = []
  if (kind === "multipart") {
    prelude.push("const form = new FormData();")
    for (const [name, value] of formFields(sample)) prelude.push(`form.append(${quoted(name)}, ${quoted(value)});`)
    prelude.push("")
    options.push("  body: form,")
  } else if (kind === "json") {
    const json = JSON.stringify(sample.body, null, 2)
    // A literal `__proto__` key would set the prototype in an object
    // literal, so send the JSON text as a string instead.
    options.push(
      json.includes('"__proto__"')
        ? `  body: ${quoted(JSON.stringify(sample.body))},`
        : `  body: JSON.stringify(${json.replace(/\n/g, "\n  ")}),`
    )
  } else {
    const body = bodyText(sample)
    if (body !== undefined) options.push(`  body: ${quoted(body)},`)
  }

  return [
    ...prelude,
    `const response = await fetch(${quoted(sample.url)}, {`,
    ...options,
    "});",
    "",
    kind === "json" || kind === "none" ? "const data = await response.json();" : "const data = await response.text();",
  ].join("\n")
}

// ---------------------------------------------------------------------------
// Python (requests)
// ---------------------------------------------------------------------------

function toPythonLiteral(value: unknown, depth = 0): string {
  const pad = "    ".repeat(depth + 1)
  const close = "    ".repeat(depth)
  if (value === null || value === undefined) return "None"
  if (value === true) return "True"
  if (value === false) return "False"
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "None"
  if (typeof value === "string") return quoted(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]"
    return `[\n${value.map((item) => pad + toPythonLiteral(item, depth + 1)).join(",\n")},\n${close}]`
  }
  if (isRecord(value)) {
    const entries = Object.entries(value)
    if (entries.length === 0) return "{}"
    return `{\n${entries.map(([key, item]) => `${pad}${quoted(key)}: ${toPythonLiteral(item, depth + 1)}`).join(",\n")},\n${close}}`
  }
  return quoted(String(value))
}

function toPython(sample: APIRequestSample): string {
  const kind = bodyKind(sample)
  const args: string[] = [`    ${quoted(sample.url)},`]

  if (sample.headers.length > 0) args.push(`    headers=${toPythonLiteral(Object.fromEntries(sample.headers), 1)},`)

  if (kind === "multipart") {
    const files = Object.fromEntries(formFields(sample).map(([k, v]) => [k, [null, v]]))
    args.push(`    files=${toPythonLiteral(files, 1)},`)
  } else if (kind === "json") {
    args.push(`    json=${toPythonLiteral(sample.body, 1)},`)
  } else if (kind === "form") {
    args.push(`    data=${toPythonLiteral(Object.fromEntries(formFields(sample)), 1)},`)
  } else if (kind === "text") {
    args.push(`    data=${quoted(bodyText(sample) ?? "")},`)
  }

  return ["import requests", "", "response = requests.request(", `    ${quoted(sample.method)},`, ...args, ")", "", "print(response.text)"].join("\n")
}

// ---------------------------------------------------------------------------
// Go (net/http)
// ---------------------------------------------------------------------------

function toGo(sample: APIRequestSample): string {
  const kind = bodyKind(sample)
  const imports = new Set(["fmt", "io", "net/http"])
  const lines: string[] = []
  let body = "nil"

  if (kind === "multipart") {
    imports.add("bytes")
    imports.add("mime/multipart")
    lines.push("\tvar payload bytes.Buffer", "\twriter := multipart.NewWriter(&payload)")
    for (const [name, value] of formFields(sample)) lines.push(`\twriter.WriteField(${quoted(name)}, ${quoted(value)})`)
    lines.push("\twriter.Close()", "")
    body = "&payload"
  } else if (kind !== "none") {
    imports.add("strings")
    lines.push(`\tpayload := strings.NewReader(${multiline.go(bodyText(sample) ?? "")})`, "")
    body = "payload"
  }

  lines.push(`\treq, err := http.NewRequest(${quoted(sample.method)}, ${quoted(sample.url)}, ${body})`)
  lines.push("\tif err != nil {", "\t\tpanic(err)", "\t}")
  for (const [name, value] of sample.headers) lines.push(`\treq.Header.Set(${quoted(name)}, ${quoted(value)})`)
  if (kind === "multipart") lines.push(`\treq.Header.Set("Content-Type", writer.FormDataContentType())`)

  lines.push(
    "",
    "\tres, err := http.DefaultClient.Do(req)",
    "\tif err != nil {",
    "\t\tpanic(err)",
    "\t}",
    "\tdefer res.Body.Close()",
    "",
    "\tdata, _ := io.ReadAll(res.Body)",
    "\tfmt.Println(string(data))"
  )

  return [
    "package main",
    "",
    "import (",
    ...[...imports].sort().map((name) => `\t${quoted(name)}`),
    ")",
    "",
    "func main() {",
    ...lines,
    "}",
  ].join("\n")
}

// ---------------------------------------------------------------------------
// Rust (reqwest, blocking)
// ---------------------------------------------------------------------------

function toRust(sample: APIRequestSample): string {
  const kind = bodyKind(sample)
  const chain: string[] = [`        .request(Method::${sample.method}, ${rustString(sample.url)})`]

  for (const [name, value] of headersWithout(sample, kind === "form" || kind === "multipart")) {
    chain.push(`        .header(${rustString(name)}, ${rustString(value)})`)
  }

  const prelude: string[] = []
  if (kind === "multipart") {
    prelude.push("    let form = multipart::Form::new()")
    for (const [name, value] of formFields(sample)) prelude.push(`        .text(${rustString(name)}, ${rustString(value)})`)
    prelude[prelude.length - 1] += ";"
    prelude.push("")
    chain.push("        .multipart(form)")
  } else if (kind === "form") {
    const pairs = formFields(sample).map(([k, v]) => `(${rustString(k)}, ${rustString(v)})`)
    chain.push(`        .form(&[${pairs.join(", ")}])`)
  } else if (kind !== "none") {
    chain.push(`        .body(${multiline.rust(bodyText(sample) ?? "")})`)
  }
  chain.push("        .send()?;")

  const uses = kind === "multipart" ? "use reqwest::blocking::{multipart, Client};" : "use reqwest::blocking::Client;"

  return [
    uses,
    "use reqwest::Method;",
    "",
    "fn main() -> Result<(), Box<dyn std::error::Error>> {",
    ...prelude,
    "    let response = Client::new()",
    ...chain,
    "",
    '    println!("{}", response.text()?);',
    "    Ok(())",
    "}",
  ].join("\n")
}

// ---------------------------------------------------------------------------
// Java (java.net.http)
// ---------------------------------------------------------------------------

function toJava(sample: APIRequestSample): string {
  const kind = bodyKind(sample)
  const prelude: string[] = []
  let publisher = "HttpRequest.BodyPublishers.noBody()"
  const headers = [...sample.headers]

  if (kind === "multipart") {
    // java.net.http has no multipart builder; write the body by hand.
    const boundary = "AriadocsBoundary"
    const parts = formFields(sample)
      .map(([name, value]) => `--${boundary}\r\nContent-Disposition: form-data; name="${name.replace(/"/g, "%22")}"\r\n\r\n${value}\r\n`)
      .join("")
    prelude.push(`        String body = ${quoted(`${parts}--${boundary}--\r\n`)};`, "")
    headers.push(["Content-Type", `multipart/form-data; boundary=${boundary}`])
    publisher = "HttpRequest.BodyPublishers.ofString(body)"
  } else if (kind !== "none") {
    prelude.push(`        String body = ${indent(multiline.java(bodyText(sample) ?? ""), "            ").trimStart()};`, "")
    publisher = "HttpRequest.BodyPublishers.ofString(body)"
  }

  return [
    "import java.net.URI;",
    "import java.net.http.HttpClient;",
    "import java.net.http.HttpRequest;",
    "import java.net.http.HttpResponse;",
    "",
    "public class Main {",
    "    public static void main(String[] args) throws Exception {",
    ...prelude,
    "        HttpRequest request = HttpRequest.newBuilder()",
    `            .uri(URI.create(${quoted(sample.url)}))`,
    ...headers.map(([name, value]) => `            .header(${quoted(name)}, ${quoted(value)})`),
    `            .method(${quoted(sample.method)}, ${publisher})`,
    "            .build();",
    "",
    "        HttpResponse<String> response = HttpClient.newHttpClient()",
    "            .send(request, HttpResponse.BodyHandlers.ofString());",
    "        System.out.println(response.body());",
    "    }",
    "}",
  ].join("\n")
}

// ---------------------------------------------------------------------------
// Kotlin (OkHttp)
// ---------------------------------------------------------------------------

function toKotlin(sample: APIRequestSample): string {
  const kind = bodyKind(sample)
  const imports = new Set(["okhttp3.OkHttpClient", "okhttp3.Request"])
  const prelude: string[] = []
  let body = "null"

  if (kind === "multipart") {
    imports.add("okhttp3.MultipartBody")
    prelude.push("    val body = MultipartBody.Builder()", "        .setType(MultipartBody.FORM)")
    for (const [name, value] of formFields(sample)) prelude.push(`        .addFormDataPart(${kotlinString(name)}, ${kotlinString(value)})`)
    prelude.push("        .build()", "")
    body = "body"
  } else if (kind === "form") {
    imports.add("okhttp3.FormBody")
    prelude.push("    val body = FormBody.Builder()")
    for (const [name, value] of formFields(sample)) prelude.push(`        .add(${kotlinString(name)}, ${kotlinString(value)})`)
    prelude.push("        .build()", "")
    body = "body"
  } else if (kind !== "none") {
    imports.add("okhttp3.MediaType.Companion.toMediaType")
    imports.add("okhttp3.RequestBody.Companion.toRequestBody")
    prelude.push(
      `    val body = ${indent(multiline.kotlin(bodyText(sample) ?? ""), "    ").trimStart()}`,
      `        .toRequestBody(${kotlinString(sample.contentType ?? "text/plain")}.toMediaType())`,
      ""
    )
    body = "body"
  }

  return [
    ...[...imports].sort().map((name) => `import ${name}`),
    "",
    "fun main() {",
    ...prelude,
    "    val request = Request.Builder()",
    `        .url(${kotlinString(sample.url)})`,
    ...headersWithout(sample, kind !== "none").map(([name, value]) => `        .addHeader(${kotlinString(name)}, ${kotlinString(value)})`),
    `        .method(${kotlinString(sample.method)}, ${body})`,
    "        .build()",
    "",
    "    OkHttpClient().newCall(request).execute().use { response ->",
    "        println(response.body?.string())",
    "    }",
    "}",
  ].join("\n")
}

// ---------------------------------------------------------------------------
// C# (HttpClient)
// ---------------------------------------------------------------------------

function toCSharp(sample: APIRequestSample): string {
  const kind = bodyKind(sample)
  const lines: string[] = [
    "using var client = new HttpClient();",
    `var request = new HttpRequestMessage(new HttpMethod(${quoted(sample.method)}), ${quoted(sample.url)});`,
  ]

  for (const [name, value] of headersWithout(sample, kind !== "none")) {
    lines.push(`request.Headers.TryAddWithoutValidation(${quoted(name)}, ${quoted(value)});`)
  }

  if (kind === "multipart") {
    lines.push("", "var form = new MultipartFormDataContent();")
    for (const [name, value] of formFields(sample)) lines.push(`form.Add(new StringContent(${quoted(value)}), ${quoted(name)});`)
    lines.push("request.Content = form;")
  } else if (kind === "form") {
    lines.push("", "request.Content = new FormUrlEncodedContent(new Dictionary<string, string>", "{")
    for (const [name, value] of formFields(sample)) lines.push(`    [${quoted(name)}] = ${quoted(value)},`)
    lines.push("});")
  } else if (kind !== "none") {
    lines.push(
      "",
      `var body = ${multiline.csharp(bodyText(sample) ?? "")};`,
      `request.Content = new StringContent(body, Encoding.UTF8, ${quoted((sample.contentType ?? "text/plain").split(";")[0] ?? "text/plain")});`
    )
  }

  lines.push(
    "",
    "var response = await client.SendAsync(request);",
    "Console.WriteLine(await response.Content.ReadAsStringAsync());"
  )

  return ["using System.Text;", "", ...lines].join("\n")
}
