import { OpenAPIError } from "../errors.js"

/**
 * Browser / edge implementation: there is no file system. Bundlers pick this
 * module through the `#read-file` import condition, so client bundles never
 * pull in `node:fs`.
 */
export async function readFile(): Promise<string> {
  throw new OpenAPIError(
    "Reading OpenAPI files is only supported in Node.js, Bun and Deno. In the browser, pass the document object, its text or an http(s) URL.",
    "OPENAPI_LOAD_ERROR"
  )
}

export const canReadFiles = false
