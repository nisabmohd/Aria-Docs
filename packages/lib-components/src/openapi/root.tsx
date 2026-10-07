"use client"

import type { ReactNode } from "react"
import type { APISpec } from "@ariadocs/openapi"
import { OpenAPIProvider } from "./context.js"

export interface OpenAPIRootProps {
  /** The model from `parseOpenAPI()` / `openapi.parse()`. */
  api: APISpec
  /**
   * Base path for per-operation pages, e.g. `"/api"` → `/api/listPets`.
   * Without it, operations link to `#id` anchors on the same page.
   */
  operationBaseHref?: string
  children?: ReactNode
}

/** Provides the parsed API to every `OpenAPI.*` component below it. Renders no UI. */
export function OpenAPIRoot({ api, operationBaseHref, children }: OpenAPIRootProps) {
  return (
    <OpenAPIProvider api={api} operationBaseHref={operationBaseHref}>
      {children}
    </OpenAPIProvider>
  )
}
