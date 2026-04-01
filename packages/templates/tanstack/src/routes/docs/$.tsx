import { createFileRoute, notFound } from "@tanstack/react-router";
import { MdxClient } from "@ariadocs/react/client";
import { docs } from "#/ariadocs";
import NavList from "#/components/sidebar";
import TableOfContents from "#/components/toc";

export const Route = createFileRoute("/docs/$")({
  loader: async ({ params }) => {
    const slug = params._splat;
    if (!slug) throw notFound();
    const data = await docs.serialize({ slug });
    const nav = await docs.getNavItems();
    return { ...data, nav };
  },
  component: Page,
});

function Page() {
  const { serialized, toc, nav } = Route.useLoaderData();

  return (
    <div className="grid grid-cols-6">
      <NavList items={nav} />
      <article className="col-span-4">
        <MdxClient serialized={serialized} />
      </article>
      <TableOfContents toc={toc} />
    </div>
  );
}
