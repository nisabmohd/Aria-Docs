# API cheat sheet

Full docs: https://ariadocs.vercel.app/docs/openapi

| Export | Notes |
| --- | --- |
| `createOpenAPI(options)` | Cached instance: `parse`, `getNavigation`, `getPagePaths`, `getOperation`, `getSchema`, `search`, `reload` |
| `parseOpenAPI({ source, allowFiles?, allowRemote? })` | Returns `APISpec` |
| `loadOpenAPI`, `validateOpenAPI`, `resolveRefs`, `normalizeOpenAPI` | The parsing steps on their own |
| `getNavigation(api, { getOperationHref? })` | One group per tag. Default links are `#id`. |
| `getPagePaths(api)` | `["/emails-send", ...]` |
| `getOperation(api, id)`, `getSchema(api, name)` | Lookup by `id` or `operationId` |
| `search(api, query, { limit? })` | Endpoints, schemas and tags |
| `createRequestSample(operation)`, `createCodeSample(sample, language)` | Languages: `curl`, `javascript`, `python`, `go`, `rust`, `java`, `kotlin`, `csharp` |
| `getServerUrl`, `getPrimaryResponse`, `getOperationTitle`, `getSchemaProperties`, `getSchemaTypeLabel`, `generateSchemaExample` | Helpers |

`APISpec` contains `operations`, `tags` and `schemas`. Types: `APISpec`, `APIOperation`, `APIParameter`, `APIRequestBody`, `APIResponse`, `APISchema`, `APITag`, `APIServer`, `APISecurityScheme`, `OpenAPIError`.
