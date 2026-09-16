// NOTE: intentionally no "use client" here. This module assembles the
// `OpenAPI` namespace object on whichever side imports it. The leaf modules
// it imports are client components, so their exports arrive here as client
// references — keeping the assembled object usable from React Server
// Components (a namespace object exported directly from a "use client"
// module would be an opaque reference on the server).

import { OpenAPIDocs } from "./docs.js"
import { OpenAPIContent, OpenAPILayout } from "./layout.js"
import { OpenAPIOperation } from "./operation.js"
import { OpenAPIParameter } from "./parameter.js"
import { OpenAPIRequestBody } from "./request-body.js"
import { OpenAPIResponse } from "./response.js"
import { OpenAPIRoot } from "./root.js"
import { OpenAPISchema } from "./schema.js"
import { OpenAPICode, OpenAPIExample } from "./code.js"
import { OpenAPISecurity } from "./security.js"
import { OpenAPIServer } from "./server.js"
import { OpenAPISidebar } from "./sidebar.js"

// Compound parts
import {
  OperationDeprecated,
  OperationDescription,
  OperationHeader,
  OperationMethod,
  OperationParameters,
  OperationPath,
  OperationRequestBody,
  OperationResponses,
  OperationServers,
  OperationSummary,
} from "./operation.js"
import {
  ParameterDescription,
  ParameterExample,
  ParameterIn,
  ParameterName,
  ParameterRequired,
  ParameterSchema,
} from "./parameter.js"
import { RequestBodyContent, RequestBodyDescription } from "./request-body.js"
import {
  ResponseContent,
  ResponseDescription,
  ResponseHeaders,
  ResponseStatus,
} from "./response.js"
import {
  SchemaDescription,
  SchemaProperties,
  SchemaTitle,
} from "./schema.js"

/**
 * The `OpenAPI` component namespace for `@ariadocs/components`.
 *
 * ```tsx
 * <OpenAPI.Root api={api}>
 *   <OpenAPI.Docs />
 * </OpenAPI.Root>
 * ```
 */
export const OpenAPI = {
  Root: OpenAPIRoot,
  Docs: OpenAPIDocs,
  Layout: OpenAPILayout,
  Sidebar: OpenAPISidebar,
  Content: OpenAPIContent,
  Operation: withCompound(OpenAPIOperation, {
    Header: OperationHeader,
    Method: OperationMethod,
    Path: OperationPath,
    Deprecated: OperationDeprecated,
    Summary: OperationSummary,
    Description: OperationDescription,
    Parameters: OperationParameters,
    RequestBody: OperationRequestBody,
    Responses: OperationResponses,
    Security: OpenAPISecurity,
    Servers: OperationServers,
  }),
  Parameter: withCompound(OpenAPIParameter, {
    Name: ParameterName,
    In: ParameterIn,
    Required: ParameterRequired,
    Description: ParameterDescription,
    Schema: ParameterSchema,
    Example: ParameterExample,
  }),
  RequestBody: withCompound(OpenAPIRequestBody, {
    Description: RequestBodyDescription,
    Content: RequestBodyContent,
  }),
  Response: withCompound(OpenAPIResponse, {
    Status: ResponseStatus,
    Description: ResponseDescription,
    Headers: ResponseHeaders,
    Content: ResponseContent,
  }),
  Schema: withCompound(OpenAPISchema, {
    Title: SchemaTitle,
    Description: SchemaDescription,
    Properties: SchemaProperties,
  }),
  Code: OpenAPICode,
  Example: OpenAPIExample,
  Security: OpenAPISecurity,
  Server: OpenAPIServer,
}

type WithCompound<T extends object, P extends Record<string, unknown>> = T & P

function withCompound<T extends object, P extends Record<string, unknown>>(
  component: T,
  parts: P
): WithCompound<T, P> {
  return Object.assign(component, parts)
}
