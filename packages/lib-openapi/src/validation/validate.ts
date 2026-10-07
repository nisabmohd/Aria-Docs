import { isRecord } from "@ariadocs/core"
import type { ValidationIssue } from "../errors.js"
import { isHttpMethod } from "../normalize/parameters.js"
import { toPointer } from "../refs/pointer.js"

export interface ValidationResult {
  valid: boolean
  errors: ValidationIssue[]
}

/**
 * Structural validation for OpenAPI 3.0, 3.1 and 3.2 documents.
 *
 * This is not a full JSON Schema validation of the specification. It catches
 * the mistakes that make a document unusable (missing `openapi` version or
 * `info`, Swagger 2.0 input, wrongly typed sections) so normalization can
 * proceed safely.
 */
export function validateOpenAPI(document: unknown): ValidationResult {
  const errors: ValidationIssue[] = []

  if (!isRecord(document)) {
    return { valid: false, errors: [{ path: "", message: "Document must be a JSON/YAML object." }] }
  }

  if (document.swagger !== undefined) {
    return {
      valid: false,
      errors: [
        {
          path: "/swagger",
          message:
            "Swagger 2.0 documents are not supported. Convert the document to OpenAPI 3 first (e.g. with swagger2openapi).",
        },
      ],
    }
  }

  const version = document.openapi
  if (typeof version !== "string") {
    errors.push({ path: "/openapi", message: 'Missing required "openapi" version string (e.g. "3.1.0").' })
  } else if (!/^3\.[0-2](\.\d+)?(-[\w.]+)?$/.test(version.trim())) {
    errors.push({
      path: "/openapi",
      message: `Unsupported OpenAPI version "${version.slice(0, 20)}". Supported versions: 3.0.x, 3.1.x and 3.2.x.`,
    })
  }

  const info = document.info
  if (!isRecord(info)) {
    errors.push({ path: "/info", message: 'Missing required "info" object.' })
  } else {
    if (typeof info.title !== "string" || info.title.trim() === "") {
      errors.push({ path: "/info/title", message: 'Missing required "info.title".' })
    }
    if ((typeof info.version !== "string" || info.version.trim() === "") && typeof info.version !== "number") {
      errors.push({ path: "/info/version", message: 'Missing required "info.version".' })
    }
  }

  if (document.paths !== undefined && !isRecord(document.paths)) {
    errors.push({ path: "/paths", message: '"paths" must be an object.' })
  }

  if (isRecord(document.paths)) {
    for (const [path, pathItem] of Object.entries(document.paths)) {
      if (!isRecord(pathItem)) {
        errors.push({ path: toPointer(["paths", path]), message: "Path item must be an object." })
        continue
      }
      for (const key of Object.keys(pathItem)) {
        if (isHttpMethod(key) && !isRecord(pathItem[key])) {
          errors.push({
            path: toPointer(["paths", path, key]),
            message: `"${key}" operation must be an object.`,
          })
        }
      }
      for (const key of ["parameters", "servers"]) {
        if (pathItem[key] !== undefined && !Array.isArray(pathItem[key])) {
          errors.push({ path: toPointer(["paths", path, key]), message: `"${key}" must be an array.` })
        }
      }
    }
  }

  if (document.components !== undefined && !isRecord(document.components)) {
    errors.push({ path: "/components", message: '"components" must be an object.' })
  }

  if (isRecord(document.components)) {
    for (const key of [
      "schemas",
      "responses",
      "parameters",
      "examples",
      "requestBodies",
      "headers",
      "securitySchemes",
      "links",
      "callbacks",
      "pathItems",
    ]) {
      const value = document.components[key]
      if (value !== undefined && !isRecord(value)) {
        errors.push({ path: `/components/${key}`, message: `"components.${key}" must be an object.` })
      }
    }
  }

  for (const key of ["servers", "tags", "security"]) {
    if (document[key] !== undefined && !Array.isArray(document[key])) {
      errors.push({ path: `/${key}`, message: `"${key}" must be an array.` })
    }
  }

  if (document.webhooks !== undefined && !isRecord(document.webhooks)) {
    errors.push({ path: "/webhooks", message: '"webhooks" must be an object.' })
  }

  return { valid: errors.length === 0, errors }
}
