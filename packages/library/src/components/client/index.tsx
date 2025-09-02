import { MDXClient, type MDXComponents } from "next-mdx-remote-client";
import { type SerializeResult } from "next-mdx-remote-client/serialize";

export type SerializedClientResult = SerializeResult;

export type MDXClientSerializedProps = {
  serialized: SerializedClientResult;
  mdxComponents?: MDXComponents;
};

export function MdxClient({
  serialized,
  mdxComponents,
}: MDXClientSerializedProps) {
  if (!serialized || "error" in serialized)
    throw new Error("Failed to render Markdown");
  return <MDXClient {...serialized} components={mdxComponents} />;
}
