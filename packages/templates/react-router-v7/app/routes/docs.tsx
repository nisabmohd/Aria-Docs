import { useLoaderData } from "react-router";
import { MdxClient } from "@ariadocs/react/client";
import type { Route } from "./+types/docs";
import { docs } from "~/ariadocs";
import NavList from "~/components/sidebar";
import TableOfContents from "~/components/toc";

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params["*"];
  const data = await docs.serialize({ slug });
  const nav = await docs.getNavItems();
  return { ...data, nav };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const { frontmatter } = loaderData;
  return [
    { title: frontmatter["title"] },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Docs() {
  const { serialized, toc, nav } = useLoaderData<typeof loader>();
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
