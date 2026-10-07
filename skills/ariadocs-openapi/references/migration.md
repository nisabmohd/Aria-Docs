# Migrating from pre-1.0 @ariadocs/openapi

| Before | After |
| --- | --- |
| `openapi.parse(input, options)` | `parseOpenAPI({ source, ...options })` or `createOpenAPI({ source }).parse()` |
| `openapi.validate(input)` | `validateOpenAPI(document)` |
| `openapi.navigation(api)` | `getNavigation(api)` |
| `openapi.search(api, query)` | `search(api, query)` |
| `AriadocsOpenAPI` | `APISpec` |
| `api.groups` | `api.tags` |
| `OpenAPIParseError` | `OpenAPIError` |
