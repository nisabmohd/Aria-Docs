<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/nisabmohd/Aria-Docs/master/assets/logo-mark-dark.svg">
    <img alt="Ariadocs" src="https://raw.githubusercontent.com/nisabmohd/Aria-Docs/master/assets/logo-mark-light.svg" width="48">
  </picture>
</p>

# @ariadocs/openapi

Read an OpenAPI 3.0, 3.1 or 3.2 spec into typed data your UI can render. Part of [Ariadocs](https://github.com/nisabmohd/Aria-Docs). It has no UI code and runs on Node.js, Bun, Deno, edge runtimes and in the browser.

```bash
pnpm add @ariadocs/openapi
```

## Usage

```ts
import { createOpenAPI } from "@ariadocs/openapi";

export const openapi = createOpenAPI({ source: "./openapi.yaml" });

const api = await openapi.parse(); // parsed once, then cached
api.operations; // every endpoint
api.tags; // endpoints grouped by tag
api.schemas; // components.schemas

const sidebar = await openapi.getNavigation();
const paths = await openapi.getPagePaths(); // one per endpoint
```

`source` can be a file path, a URL, JSON or YAML text, or the spec object. For a one-off call, use `parseOpenAPI({ source })`.

## Specs you didn't write

The parser limits size and nesting, keeps `__proto__` keys from touching built-in objects, removes `javascript:` links, and escapes every value in generated code samples. If the source comes from a user, also turn off file and network access:

```ts
await parseOpenAPI({ source: userInput, allowFiles: false, allowRemote: false });
```

## Docs

[ariadocs.vercel.app/docs/openapi](https://ariadocs.vercel.app/docs/openapi)

## License

MIT © [Nisab Mohd](https://github.com/nisabmohd)
