import type { OpenAPIDocument } from "../types/index.js"
import { isHttpMethod } from "../normalize/parameters.js"
import { isRecord } from "../normalize/servers.js"
import type { ValidationIssue } from "./errors.js"

export interface ValidationResult {
  valid: boolean
  errors: ValidationIssue[]
}

/**
 * Structural validation for OpenAPI documents (3.0.x and 3.1.x).
 *
 * This is deliberately not a full JSON-Schema validation of the spec — it
 * catches the mistakes that make documents unusable (missing `openapi`
 * version, missing `info`, invalid methods in path items, and so on) so that
 * normalization can proceed safely.
 */
export function validate(document: unknown): ValidationResult {
  const errors: ValidationIssue[] = []

  if (!isRecord(document)) {
    return {
      valid: false,
      errors: [{ path: "", message: "Document must be a JSON object." }],
    }
  }

  const version = document.openapi
  if (typeof version !== "string") {
    errors.push({
      path: "/openapi",
      message: 'Missing required "openapi" version field (e.g. "3.1.0").',
    })
  } else if (!/^3\.(0|1)\.\d+/u.test(version)) {
    errors.push({
      path: "/openapi",
      message: `Unsupported OpenAPI version "${version}". Only 3.0.x and 3.1.x are supported.`,
    })
  }

  const info = document.info
  if (!isRecord(info)) {
    errors.push({ path: "/info", message: 'Missing required "info" object.' })
  } else {
    if (typeof info.title !== "string" || info.title === "") {
      errors.push({ path: "/info/title", message: 'Missing required "info.title".' })
    }
    if (typeof info.version !== "string" || info.version === "") {
      errors.push({ path: "/info/version", message: 'Missing required "info.version".' })
    }
  }

  if (document.paths !== undefined && !isRecord(document.paths)) {
    errors.push({ path: "/paths", message: '"paths" must be an object.' })
  }

  if (isRecord(document.paths)) {
    for (const [path, pathItem] of Object.entries(document.paths)) {
      if (!isRecord(pathItem)) continue
      for (const key of Object.keys(pathItem)) {
        if (isHttpMethod(key) && !isRecord(pathItem[key])) {
          errors.push({
            path: `/paths/${path}/${key}`,
            message: `"${key}" operation must be an object.`,
          })
        }
      }
    }
  }

  if (isRecord(document.components)) {
    for (const key of ["schemas", "securitySchemes", "responses", "parameters", "requestBodies"]) {
      const value = document.components[key]
      if (value !== undefined && !isRecord(value)) {
        errors.push({
          path: `/components/${key}`,
          message: `"components.${key}" must be an object.`,
        })
      }
    }
  }

  if (document.servers !== undefined && !Array.isArray(document.servers)) {
    errors.push({ path: "/servers", message: '"servers" must be an array.' })
  }

  if (document.webhooks !== undefined && !isRecord(document.webhooks)) {
    errors.push({ path: "/webhooks", message: '"webhooks" must be an object (OpenAPI 3.1).' })
  }

  return { valid: errors.length === 0, errors }
}

export type { OpenAPIDocument }
