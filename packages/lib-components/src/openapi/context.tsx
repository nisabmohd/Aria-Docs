"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import {
  getOperation,
  getSchema,
  type APIOperation,
  type APIParameter,
  type APIResponse,
  type APISchema,
  type APISpec,
} from "@ariadocs/openapi"

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface OpenAPIContextValue {
  api: APISpec
  /** Link to an operation: `${operationBaseHref}/${id}`, or `#${id}` when no base is set. */
  getOperationHref: (operation: APIOperation) => string
  getOperation: (id: string) => APIOperation | undefined
  getSchema: (name: string) => APISchema | undefined
}

const OpenAPIContext = createContext<OpenAPIContextValue | null>(null)

export function OpenAPIProvider({
  api,
  operationBaseHref,
  children,
}: {
  api: APISpec
  operationBaseHref?: string
  children?: ReactNode
}) {
  const value = useMemo<OpenAPIContextValue>(
    () => ({
      api,
      getOperationHref: (operation) =>
        operationBaseHref === undefined
          ? `#${operation.id}`
          : `${operationBaseHref.replace(/\/+$/, "")}/${encodeURIComponent(operation.id)}`,
      getOperation: (id) => getOperation(api, id),
      getSchema: (name) => getSchema(api, name),
    }),
    [api, operationBaseHref]
  )
  return <OpenAPIContext.Provider value={value}>{children}</OpenAPIContext.Provider>
}

/** The parsed API from the nearest `<OpenAPI.Root>`. Throws outside of it. */
export function useOpenAPI(): OpenAPIContextValue {
  const context = useContext(OpenAPIContext)
  if (context === null) {
    throw new Error("useOpenAPI() and OpenAPI.* components must be used inside <OpenAPI.Root api={api}>.")
  }
  return context
}

/** Like `useOpenAPI`, but returns `null` outside `<OpenAPI.Root>`. */
export function useOptionalOpenAPI(): OpenAPIContextValue | null {
  return useContext(OpenAPIContext)
}

// ---------------------------------------------------------------------------
// Scoped contexts: Operation, Parameter, Response, Schema
// ---------------------------------------------------------------------------

function createScope<T>(component: string, hook: string) {
  const Context = createContext<T | null>(null)

  function Provider({ value, children }: { value: T; children?: ReactNode }) {
    return <Context.Provider value={value}>{children}</Context.Provider>
  }

  function useRequired(): T {
    const value = useContext(Context)
    if (value === null) {
      throw new Error(`${hook}() and its parts must be used inside <${component}>.`)
    }
    return value
  }

  function useOptional(): T | null {
    return useContext(Context)
  }

  return { Provider, useRequired, useOptional }
}

const operationScope = createScope<APIOperation>("OpenAPI.Operation", "useOperation")
const parameterScope = createScope<APIParameter>("OpenAPI.Parameter", "useParameter")
const responseScope = createScope<APIResponse>("OpenAPI.Response", "useResponse")
const schemaScope = createScope<{ schema: APISchema; name?: string }>("OpenAPI.Schema", "useSchema")

export const OperationProvider = operationScope.Provider
/** The operation from the nearest `<OpenAPI.Operation>`. */
export const useOperation = operationScope.useRequired
export const useOptionalOperation = operationScope.useOptional

export const ParameterProvider = parameterScope.Provider
/** The parameter from the nearest `<OpenAPI.Parameter>`. */
export const useParameter = parameterScope.useRequired
export const useOptionalParameter = parameterScope.useOptional

export const ResponseProvider = responseScope.Provider
/** The response from the nearest `<OpenAPI.Response>`. */
export const useResponse = responseScope.useRequired
export const useOptionalResponse = responseScope.useOptional

export const SchemaProvider = schemaScope.Provider
/** The schema (and its name) from the nearest `<OpenAPI.Schema>`. */
export const useSchema = schemaScope.useRequired
export const useOptionalSchema = schemaScope.useOptional
