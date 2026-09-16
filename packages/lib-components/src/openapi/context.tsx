"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import {
  getNavigation,
  search,
  type APIOperation,
  type APIParameter,
  type APISchema,
  type APISearchResult,
  type APINavigation,
  type APIResponse,
  type AriadocsOpenAPI,
} from "@ariadocs/openapi"

export interface OpenAPIRootContextValue {
  api: AriadocsOpenAPI
  getOperation: (id: string) => APIOperation | undefined
  getSchema: (name: string) => APISchema | undefined
  navigation: APINavigation
  search: (query: string) => APISearchResult[]
}

const OpenAPIContext = createContext<OpenAPIRootContextValue | null>(null)

export function OpenAPIProvider({
  api,
  children,
}: {
  api: AriadocsOpenAPI
  children?: ReactNode
}) {
  const value = useMemo<OpenAPIRootContextValue>(
    () => ({
      api,
      getOperation: (id: string) => api.operations.find((operation) => operation.id === id),
      getSchema: (name: string) => api.schemas[name],
      navigation: getNavigation(api),
      search: (query: string) => search(api, query),
    }),
    [api]
  )

  return <OpenAPIContext.Provider value={value}>{children}</OpenAPIContext.Provider>
}

export function useOpenAPIContext(): OpenAPIRootContextValue {
  const context = useContext(OpenAPIContext)
  if (context === null) {
    throw new Error("OpenAPI components must be rendered inside <OpenAPI.Root>.")
  }
  return context
}

// ---------------------------------------------------------------------------
// Operation
// ---------------------------------------------------------------------------

export interface OperationContextValue {
  operation: APIOperation
}

const OperationContext = createContext<OperationContextValue | null>(null)

export function OperationProvider({
  operation,
  children,
}: {
  operation: APIOperation
  children?: ReactNode
}) {
  const value = useMemo<OperationContextValue>(() => ({ operation }), [operation])
  return <OperationContext.Provider value={value}>{children}</OperationContext.Provider>
}

export function useOperationContext(): OperationContextValue {
  const context = useContext(OperationContext)
  if (context === null) {
    throw new Error("Operation components must be rendered inside <OpenAPI.Operation>.")
  }
  return context
}

/** Like `useOperationContext`, but returns `null` instead of throwing when absent. */
export function useOptionalOperationContext(): OperationContextValue | null {
  return useContext(OperationContext)
}

// ---------------------------------------------------------------------------
// Parameter
// ---------------------------------------------------------------------------

export interface ParameterContextValue {
  parameter: APIParameter
}

const ParameterContext = createContext<ParameterContextValue | null>(null)

export function ParameterProvider({
  parameter,
  children,
}: {
  parameter: APIParameter
  children?: ReactNode
}) {
  const value = useMemo<ParameterContextValue>(() => ({ parameter }), [parameter])
  return <ParameterContext.Provider value={value}>{children}</ParameterContext.Provider>
}

export function useParameterContext(): ParameterContextValue {
  const context = useContext(ParameterContext)
  if (context === null) {
    throw new Error("Parameter components must be rendered inside <OpenAPI.Parameter>.")
  }
  return context
}

/** Like `useParameterContext`, but returns `null` instead of throwing when absent. */
export function useOptionalParameterContext(): ParameterContextValue | null {
  return useContext(ParameterContext)
}

// ---------------------------------------------------------------------------
// Response
// ---------------------------------------------------------------------------

export interface ResponseContextValue {
  response: APIResponse
}

const ResponseContext = createContext<ResponseContextValue | null>(null)

export function ResponseProvider({
  response,
  children,
}: {
  response: APIResponse
  children?: ReactNode
}) {
  const value = useMemo<ResponseContextValue>(() => ({ response }), [response])
  return <ResponseContext.Provider value={value}>{children}</ResponseContext.Provider>
}

export function useResponseContext(): ResponseContextValue {
  const context = useContext(ResponseContext)
  if (context === null) {
    throw new Error("Response components must be rendered inside <OpenAPI.Response>.")
  }
  return context
}

/** Like `useResponseContext`, but returns `null` instead of throwing when absent. */
export function useOptionalResponseContext(): ResponseContextValue | null {
  return useContext(ResponseContext)
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export interface SchemaContextValue {
  schema: APISchema
  name?: string
}

const SchemaContext = createContext<SchemaContextValue | null>(null)

export function SchemaProvider({
  schema,
  name,
  children,
}: {
  schema: APISchema
  name?: string
  children?: ReactNode
}) {
  const value = useMemo<SchemaContextValue>(() => ({ schema, name }), [schema, name])
  return <SchemaContext.Provider value={value}>{children}</SchemaContext.Provider>
}

export function useSchemaContext(): SchemaContextValue {
  const context = useContext(SchemaContext)
  if (context === null) {
    throw new Error("Schema components must be rendered inside <OpenAPI.Schema>.")
  }
  return context
}

/** Like `useSchemaContext`, but returns `null` instead of throwing when absent. */
export function useOptionalSchemaContext(): SchemaContextValue | null {
  return useContext(SchemaContext)
}
