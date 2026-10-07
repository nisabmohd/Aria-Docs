"use client"

import { MDXClient } from "next-mdx-remote-client"
import type { MdxClientProps } from "../types.js"

/**
 * Render MDX compiled by `serializeMdx()` in a Client Component.
 *
 * ```tsx
 * "use client";
 * import { MdxClient } from "@ariadocs/mdx/client";
 *
 * export function Page({ serialized }) {
 *   return <MdxClient serialized={serialized} components={{ Callout }} />;
 * }
 * ```
 *
 * Import it from `@ariadocs/mdx/client`: the main entry also exports
 * file-system helpers that can't be bundled for the browser.
 */
export function MdxClient({ serialized, components }: MdxClientProps) {
  if ("error" in serialized) {
    throw serialized.error
  }
  return <MDXClient {...serialized} components={components} />
}

export type { MdxClientProps }
