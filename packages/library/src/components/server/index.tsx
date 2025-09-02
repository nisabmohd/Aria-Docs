import { MDXRemote, type MDXComponents } from "next-mdx-remote-client/rsc";
import { type RehypePlugins, type RemarkPlugins } from "@ariadocs/react/utils";

export type MDXProps = {
  raw: string;
  options?: {
    remarkPlugins?: RemarkPlugins;
    rehypePlugins?: RehypePlugins;
  };
  components?: MDXComponents;
};

export function MdxServer({ raw, options, components }: MDXProps) {
  return (
    <MDXRemote
      source={raw}
      options={{
        mdxOptions: {
          rehypePlugins: options?.rehypePlugins,
          remarkPlugins: options?.remarkPlugins,
        },
        parseFrontmatter: false,
      }}
      components={components}
    />
  );
}
