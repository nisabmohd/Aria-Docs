import { isRecord, truncate } from "@ariadocs/core"
import { readFile } from "#read-file"
import { OpenAPIError } from "../errors.js"
import {
  DEFAULT_MAX_SIZE,
  DEFAULT_TIMEOUT,
  type LoadOpenAPIOptions,
} from "../options.js"
import type { OpenAPIDocument } from "../types/index.js"
import { parseText } from "./text.js"

/**
 * Load an OpenAPI document from any supported source into a plain object.
 * The document is not validated or normalized; use `parseOpenAPI` for that.
 *
 * Strings are classified without guessing:
 * - `http://` / `https://` → fetched (unless `allowRemote: false`),
 * - `file:` → read from disk (unless `allowFiles: false`),
 * - text starting with `{` / `[`, containing a newline, or a single
 *   `key: value` YAML line → parsed as content,
 * - anything else → a local file path (unless `allowFiles: false`).
 */
export async function loadOpenAPI(options: LoadOpenAPIOptions): Promise<OpenAPIDocument> {
  const { source } = options
  const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE

  if (source instanceof URL) {
    return loadUrl(source, options, maxSize)
  }

  if (typeof source === "string") {
    const trimmed = source.trim()

    if (/^https?:\/\//i.test(trimmed) || /^file:/i.test(trimmed)) {
      let url: URL
      try {
        url = new URL(trimmed)
      } catch (cause) {
        throw new OpenAPIError(`Invalid OpenAPI URL "${truncate(trimmed)}".`, "OPENAPI_LOAD_ERROR", { cause })
      }
      return loadUrl(url, options, maxSize)
    }

    if (isInlineContent(trimmed)) {
      if (source.length > maxSize) {
        throw new OpenAPIError(
          `OpenAPI text is larger than the ${maxSize} byte limit (maxSize).`,
          "OPENAPI_TOO_LARGE"
        )
      }
      return toDocument(parseText(source))
    }

    if (options.allowFiles === false) {
      throw new OpenAPIError(
        "OpenAPI source looks like a file path, but reading files is disabled (allowFiles: false).",
        "OPENAPI_LOAD_ERROR"
      )
    }
    const text = await readFile(trimmed, maxSize)
    return toDocument(parseText(text, truncate(trimmed)))
  }

  if (isRecord(source)) {
    return source
  }

  throw new OpenAPIError(
    "OpenAPI source must be a document object, JSON/YAML text, a URL or a file path.",
    "OPENAPI_LOAD_ERROR"
  )
}

function isInlineContent(text: string): boolean {
  return (
    text.startsWith("{") ||
    text.startsWith("[") ||
    text.includes("\n") ||
    // A single-line YAML mapping such as `openapi: 3.1.0`. Requiring a space
    // after the colon keeps Windows paths (`C:\specs\api.yaml`) out.
    /^[A-Za-z_$"'][^\s:]*:\s/.test(text)
  )
}

async function loadUrl(
  url: URL,
  options: LoadOpenAPIOptions,
  maxSize: number
): Promise<OpenAPIDocument> {
  if (url.protocol === "file:") {
    if (options.allowFiles === false) {
      throw new OpenAPIError(
        "Reading files is disabled (allowFiles: false).",
        "OPENAPI_LOAD_ERROR"
      )
    }
    const text = await readFile(url, maxSize)
    return toDocument(parseText(text, truncate(url.pathname)))
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new OpenAPIError(
      `Unsupported OpenAPI URL protocol "${url.protocol}". Use http(s) or file.`,
      "OPENAPI_LOAD_ERROR"
    )
  }

  if (options.allowRemote === false) {
    throw new OpenAPIError(
      "Fetching remote OpenAPI documents is disabled (allowRemote: false).",
      "OPENAPI_LOAD_ERROR"
    )
  }

  const label = redact(url)
  const fetchImpl = options.fetch ?? globalThis.fetch
  if (typeof fetchImpl !== "function") {
    throw new OpenAPIError("No fetch implementation available; pass `fetch` in the options.", "OPENAPI_LOAD_ERROR")
  }

  let response: Response
  try {
    response = await fetchImpl(url, {
      headers: { accept: "application/json, application/yaml, text/yaml, */*;q=0.8", ...options.headers },
      signal: AbortSignal.timeout(options.timeout ?? DEFAULT_TIMEOUT),
    })
  } catch (cause) {
    const timedOut = (cause as Error | undefined)?.name === "TimeoutError"
    throw new OpenAPIError(
      timedOut
        ? `Timed out fetching OpenAPI document from ${label}.`
        : `Failed to fetch OpenAPI document from ${label}.`,
      "OPENAPI_LOAD_ERROR",
      { cause }
    )
  }

  if (!response.ok) {
    throw new OpenAPIError(
      `Failed to fetch OpenAPI document from ${label}: HTTP ${response.status}.`,
      "OPENAPI_LOAD_ERROR"
    )
  }

  const text = await readBody(response, maxSize, label)
  return toDocument(parseText(text, label))
}

/** Read a response body as text, aborting as soon as it exceeds `maxSize`. */
async function readBody(response: Response, maxSize: number, label: string): Promise<string> {
  const declared = Number(response.headers.get("content-length"))
  if (Number.isFinite(declared) && declared > maxSize) {
    throw tooLarge(label, maxSize)
  }

  if (response.body === null) {
    const text = await response.text()
    if (text.length > maxSize) throw tooLarge(label, maxSize)
    return text
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let received = 0
  let text = ""

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    received += value.byteLength
    if (received > maxSize) {
      await reader.cancel()
      throw tooLarge(label, maxSize)
    }
    text += decoder.decode(value, { stream: true })
  }

  return text + decoder.decode()
}

function tooLarge(label: string, maxSize: number): OpenAPIError {
  return new OpenAPIError(
    `OpenAPI document from ${label} is larger than the ${maxSize} byte limit (maxSize).`,
    "OPENAPI_TOO_LARGE"
  )
}

/** Drop credentials and query strings (which often carry tokens) from URLs in messages. */
function redact(url: URL): string {
  return `${url.protocol}//${url.host}${truncate(url.pathname, 60)}`
}

function toDocument(value: unknown): OpenAPIDocument {
  if (!isRecord(value)) {
    throw new OpenAPIError("OpenAPI document must be a JSON/YAML object.", "OPENAPI_INVALID", {
      issues: [{ path: "", message: "Document must be an object." }],
    })
  }
  return value
}
