import { readFile as fsReadFile, stat } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { truncate } from "@ariadocs/core"
import { OpenAPIError } from "../errors.js"

/** Node.js / Bun / Deno implementation: read a local file with a size limit. */
export async function readFile(file: string | URL, maxSize: number): Promise<string> {
  const path = file instanceof URL ? fileURLToPath(file) : file
  const label = truncate(path)

  let size: number
  try {
    const info = await stat(/* turbopackIgnore: true */ path)
    if (!info.isFile()) {
      throw new OpenAPIError(`OpenAPI source "${label}" is not a file.`, "OPENAPI_LOAD_ERROR")
    }
    size = info.size
  } catch (error) {
    if (error instanceof OpenAPIError) throw error
    const code = (error as NodeJS.ErrnoException).code
    throw new OpenAPIError(
      code === "ENOENT"
        ? `OpenAPI file not found: "${label}".`
        : `Could not read OpenAPI file "${label}"${code !== undefined ? ` (${code})` : ""}.`,
      "OPENAPI_LOAD_ERROR",
      { cause: error }
    )
  }

  if (size > maxSize) {
    throw new OpenAPIError(
      `OpenAPI file "${label}" is ${size} bytes, larger than the ${maxSize} byte limit (maxSize).`,
      "OPENAPI_TOO_LARGE"
    )
  }

  return fsReadFile(/* turbopackIgnore: true */ path, "utf8")
}

export const canReadFiles = true
