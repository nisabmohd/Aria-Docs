"use client"

import type { ReactNode } from "react"
import type { AriadocsOpenAPI } from "@ariadocs/openapi"
import { OpenAPIProvider } from "./context.js"

export interface OpenAPIRootProps {
  api: AriadocsOpenAPI
  children?: ReactNode
}

/**
 * `<OpenAPI.Root>` — provides the parsed API model to every child component
 * through context. No UI of its own.
 */
export function OpenAPIRoot({ api, children }: OpenAPIRootProps) {
  return <OpenAPIProvider api={api}>{children}</OpenAPIProvider>
}
