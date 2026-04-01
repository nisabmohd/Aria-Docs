import { createFileRoute, notFound } from "@tanstack/react-router";
import { MdxClient } from "@ariadocs/react/client";
import { docs } from "#/ariadocs";

export const Route = createFileRoute("/docs/$")({
  loader: async ({ params }) => {
    const slug = params._splat;
    if (!slug) throw notFound();
    return docs.serialize({ slug });
  },
  component: Page,
});

function Page() {
  const { serialized, frontmatter } = Route.useLoaderData();

  return (
    <section>
      <title>{frontmatter.title}</title>
      <MdxClient serialized={serialized} />
    </section>
  );
}
