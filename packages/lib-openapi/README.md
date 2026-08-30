# @ariadocs/openapi

> Headless OpenAPI parser for [Aria-Docs](https://github.com/nisabmohd/Aria-Docs).
> Give it your OpenAPI document — get back a clean, typed, composable documentation model.

Pure TypeScript. **No React, no JSX, no Tailwind, no UI assumptions.** Works in Node, Bun, Deno and build scripts.

## Install

```bash
pnpm add @ariadocs/openapi
```

## Usage

```ts
import { openapi } from "@ariadocs/openapi";

// Object, raw JSON/YAML string, file path or URL
const api = await openapi.parse("./openapi.yaml");

api.info;                // { title, version, description, ... }
api.servers;             // [{ url, description, variables }]
api.tags;                // [{ name, description, operations }]
api.paths;               // { "/planets": [op, op] }
api.operations;          // every operation flattened across paths & methods
api.groups;              // operations grouped by tag (sidebar ready)
api.schemas;             // { Planet: {...} }
api.securitySchemes;     // { ApiKeyAuth: {...} }
api.webhooks;            // OpenAPI 3.1 webhooks
```

The model keeps OpenAPI vocabulary (`operations`, `schemas`, `securitySchemes`) but flattens it for UIs:

```ts
// instead of spec.paths["/planets"].get.responses["200"]
const operation = api.operations.find((op) => op.id === "listPlanets");

operation.parametersByLocation.query;   // no manual filtering
operation.responses[0].isSuccess;       // status flags precomputed
operation.requestBody?.preferredContentType;
```

## API

### `openapi` namespace

| Function | Description |
| --- | --- |
| `openapi.parse(input, options?)` | Parse + validate + resolve + normalize an OpenAPI document. |
| `openapi.validate(input)` | Structural validation without normalizing. |
| `openapi.resolve(input)` | Load a document and resolve its local `$ref` pointers. |
| `openapi.search(api, query)` | Search operations, schemas and tags. |
| `openapi.navigation(api)` | Sidebar-ready navigation from `api.groups`. |

`input` accepts an `OpenAPIDocument` object, raw JSON/YAML text, a local file path, or an `http(s)` URL.

### Parse options

```ts
interface ParseOptions {
  resolveRefs?: boolean;   // default true  — resolve local $refs (keeps schema.ref)
  dereference?: boolean;   // default false — fully inline refs, no ref markers
  validate?: boolean;      // default true  — throw OpenAPIParseError on unusable docs
  externalRefs?: boolean;  // default false — external refs (not supported yet)
  strict?: boolean;        // default false — throw on warnings instead of continuing
  includeRaw?: boolean;    // default false — keep api.raw / operation.raw
}
```

### Standalone helpers

```ts
import {
  createOperationId,        // GET /planets/{id} -> "get-planets-id"
  generateSchemaExample,    // { type: "object" } -> { id: 0, name: "string" }
  getSchemaProperties,      // first-class APISchemaProperty[] for tree rendering
  getPrimaryResponse,       // first 2xx, else lowest status
  getSuccessResponses,
  getErrorResponses,
  getNavigation,
  search, searchOperations, searchSchemas, searchTags,
  resolveRefs, dereference,
  isObjectSchema, isArraySchema, isEnumSchema, /* ... */
} from "@ariadocs/openapi";
```

### Ref handling

- Local refs (`#/components/schemas/User`) are resolved, and every resolved schema keeps its origin: `schema.ref`.
- Recursive schemas (`friend: { $ref: "#/components/schemas/User" }` inside `User`) stay finite — the inner reference is kept as a raw `$ref` instead of expanding forever.
- External refs are left as-is and reported as warnings (throw with `strict: true`).

## Relationship to other packages

```text
@ariadocs/react      parses MDX/frontmatter    (docs.parse)
@ariadocs/openapi    parses OpenAPI documents  (openapi.parse)
        │
        ▼
@ariadocs/components renders the normalized models (OpenAPI.*, Docs.*)
```

## Development

```bash
pnpm --filter @ariadocs/openapi build
pnpm --filter @ariadocs/openapi test
```

## License

MIT © [Nisab Mohd](https://github.com/nisabmohd)
