"use client";

import { MDXClient, type MDXComponents } from "next-mdx-remote-client";
import type { SerializeResult as SerializedSource } from "next-mdx-remote-client/serialize";
import type { MdxClientProps } from "../types.js";

/**
 * Client component for rendering serialized MDX content.
 * Use this with the result from `serializeMdx()`.
 *
 * @example
 * ```tsx
 * // Server component
 * import { serializeMdx, recommendedRehypePlugins } from "@ariadocs/react";
 *
 * export default async function Page() {
 *   const { serialized } = await serializeMdx({
 *     contentDir: "content/docs",
 *     slug: "getting-started",
 *     rehypePlugins: recommendedRehypePlugins,
 *   });
 *   return <DocClient serialized={serialized} />;
 * }
 *
 * // Client component
 * "use client";
 * import { MdxClient } from "@ariadocs/react";
 *
 * export function DocClient({ serialized }: { serialized: SerializedSource }) {
 *   return <MdxClient serialized={serialized} />;
 * }
 * ```
 */
export function MdxClient({ serialized, mdxComponents }: MdxClientProps) {
  if (!serialized || "error" in serialized) {
    throw new Error("Failed to render MDX: invalid serialized result");
  }

  return <MDXClient {...serialized} components={mdxComponents} />;
}

// Re-export the serialized type for convenience
export type { SerializedSource, MDXComponents };