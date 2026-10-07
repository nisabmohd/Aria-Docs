// No "use client": this module only assembles the namespace, so it can be
// imported from Server and Client Components alike. See `compound()`.

import { CodeBlock } from "../code/code-block.js"
import { compound } from "../lib/compound.js"
import { Markdown } from "../markdown.js"
import { OpenAPIDocs } from "./docs.js"
import { RequestExample, ResponseExample } from "./examples.js"
import { OpenAPIInfo } from "./info.js"
import { MethodBadge } from "./method.js"
import {
  OpenAPIOperation,
  OperationDeprecated,
  OperationDescription,
  OperationExamples,
  OperationHeader,
  OperationMethod,
  OperationPath,
  OperationSummary,
  OperationTag,
  OperationTitle,
} from "./operation.js"
import {
  OpenAPIParameter,
  OperationParameters,
  ParameterDescription,
  ParameterDetails,
  ParameterExample,
  ParameterHeader,
  ParameterIn,
  ParameterName,
  ParameterRequired,
  ParameterSchema,
} from "./parameter.js"
import { OpenAPIRequestBody, RequestBodyContent, RequestBodyDescription } from "./request-body.js"
import {
  OpenAPIResponse,
  OperationResponses,
  ResponseContent,
  ResponseDescription,
  ResponseHeaders,
  ResponseStatus,
} from "./response.js"
import { OpenAPIRoot } from "./root.js"
import { OpenAPISchema, SchemaDescription, SchemaProperties, SchemaTitle } from "./schema.js"
import { OpenAPISecurity } from "./security.js"
import { OpenAPIServer } from "./server.js"
import { OpenAPISidebar } from "./sidebar.js"

/**
 * The `OpenAPI` component namespace.
 *
 * ```tsx
 * // Everything on one page
 * <OpenAPI.Root api={api}>
 *   <OpenAPI.Docs />
 * </OpenAPI.Root>
 *
 * // One page per operation, composed from parts
 * <OpenAPI.Root api={api} operationBaseHref="/api">
 *   <OpenAPI.Operation id="listPets">
 *     <OpenAPI.Operation.Title level={1} />
 *     <OpenAPI.Operation.Header />
 *     <OpenAPI.Operation.Parameters />
 *     <OpenAPI.Operation.Responses />
 *   </OpenAPI.Operation>
 * </OpenAPI.Root>
 * ```
 */
export const OpenAPI = {
  Root: OpenAPIRoot,
  Docs: OpenAPIDocs,
  Info: OpenAPIInfo,
  Sidebar: OpenAPISidebar,
  Operation: compound(
    OpenAPIOperation,
    {
      Tag: OperationTag,
      Title: OperationTitle,
      Header: OperationHeader,
      Method: OperationMethod,
      Path: OperationPath,
      Deprecated: OperationDeprecated,
      Summary: OperationSummary,
      Description: OperationDescription,
      Security: OpenAPISecurity,
      Parameters: OperationParameters,
      RequestBody: OpenAPIRequestBody,
      Responses: OperationResponses,
      Examples: OperationExamples,
      RequestExample,
      ResponseExample,
    },
    "OpenAPI.Operation"
  ),
  Parameter: compound(
    OpenAPIParameter,
    {
      Header: ParameterHeader,
      Name: ParameterName,
      In: ParameterIn,
      Required: ParameterRequired,
      Description: ParameterDescription,
      Details: ParameterDetails,
      Schema: ParameterSchema,
      Example: ParameterExample,
    },
    "OpenAPI.Parameter"
  ),
  RequestBody: compound(
    OpenAPIRequestBody,
    { Description: RequestBodyDescription, Content: RequestBodyContent },
    "OpenAPI.RequestBody"
  ),
  Response: compound(
    OpenAPIResponse,
    {
      Status: ResponseStatus,
      Description: ResponseDescription,
      Headers: ResponseHeaders,
      Content: ResponseContent,
    },
    "OpenAPI.Response"
  ),
  Schema: compound(
    OpenAPISchema,
    { Title: SchemaTitle, Description: SchemaDescription, Properties: SchemaProperties },
    "OpenAPI.Schema"
  ),
  Security: OpenAPISecurity,
  Server: OpenAPIServer,
  Method: MethodBadge,
  Code: CodeBlock,
  Markdown,
}
