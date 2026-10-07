# Migrating from pre-release @ariadocs/components

| Before | After |
| --- | --- |
| `useOpenAPIContext()` | `useOpenAPI()` |
| `useOperationContext().operation` | `useOperation()` |
| `Docs.Root` | `Docs.Layout` |
| `styles/openapi.css` | `styles.css` |

`@ariadocs/react/styles/*.css` syntax themes moved to `@ariadocs/components/styles/syntax/*.css`.
