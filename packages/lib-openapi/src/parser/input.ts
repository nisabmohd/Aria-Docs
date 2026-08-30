import { readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { parse as parseYaml } from "yaml"
import type { OpenAPIDocument } from "../types/index.js"
import { OpenAPIParseError } from "../validation/errors.js"

/** Anything `openapi.parse()` accepts: a document object, raw JSON/YAML text, a file path or a URL. */
export type OpenAPIInput = OpenAPIDocument | string | URL

export interface LoadedInput {
  document: OpenAPIDocument
  /** Where the document came from, when known. */
  source?: string
}

/**
 * Load an `OpenAPIInput` into a plain document object.
 *
 * - Objects pass through untouched.
 * - `http(s)://` URLs (as string or `URL`) are fetched.
 * - Strings that look like inline JSON/YAML content are parsed directly.
 * - Everything else is treated as a local file path.
 */
export async function loadInput(input: OpenAPIInput): Promise<LoadedInput> {
  if (typeof input === "object" && input !== null && !(input instanceof URL)) {
    return { document: input as OpenAPIDocument }
  }

  if (input instanceof URL || isRemoteUrl(String(input))) {
    const url = input instanceof URL ? input : new URL(String(input))
    const response = await fetch(url, {
      headers: { accept: "application/json, application/yaml, text/yaml, */*" },
    })
    if (!response.ok) {
      throw new OpenAPIParseError(`Failed to fetch OpenAPI document from ${url.href}: ${response.status} ${response.statusText}`)
    }
    const text = await response.text()
    return { document: parseText(text, url.href), source: url.href }
  }

  const text = String(input)

  // Inline content: JSON starts with "{", multi-line YAML contains newlines.
  const trimmed = text.trim()
  if (trimmed.startsWith("{") || trimmed.startsWith("#") || text.includes("\n")) {
    return { document: parseText(text) }
  }

  // Otherwise treat the string as a file path.
  if (existsSync(text)) {
    const fileContent = await readFile(text, "utf8")
    return { document: parseText(fileContent, text), source: text }
  }

  // Not a file — try parsing it as inline YAML anyway.
  try {
    return { document: parseText(text) }
  } catch {
    throw new OpenAPIParseError(
      `Could not read OpenAPI input: "${text}" is neither a file path nor parsable JSON/YAML content.`
    )
  }
}

function isRemoteUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://")
}

function parseText(text: string, source?: string): OpenAPIDocument {
  const trimmed = text.trim()
  if (trimmed === "") {
    throw new OpenAPIParseError(`OpenAPI document is empty${source !== undefined ? ` (${source})` : ""}.`)
  }

  if (trimmed.startsWith("{")) {
    try {
      return JSON.parse(trimmed) as OpenAPIDocument
    } catch (error) {
      throw new OpenAPIParseError(
        `Failed to parse JSON${source !== undefined ? ` from ${source}` : ""}: ${(error as Error).message}`
      )
    }
  }

  try {
    return parseYaml(trimmed) as OpenAPIDocument
  } catch (error) {
    throw new OpenAPIParseError(
      `Failed to parse YAML${source !== undefined ? ` from ${source}` : ""}: ${(error as Error).message}`
    )
  }
}
