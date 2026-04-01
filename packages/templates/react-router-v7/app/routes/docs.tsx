import { useLoaderData } from "react-router";
import { MdxClient } from "@ariadocs/react/client";
import type { Route } from "./+types/docs";
import { docs } from "~/ariadocs";

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params["*"];
  return docs.serialize({ slug });
}

export function meta({ loaderData }: Route.MetaArgs) {
  const { frontmatter } = loaderData;
  return [
    { title: frontmatter["title"] },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Docs() {
  const { serialized, frontmatter } = useLoaderData<typeof loader>();
  return (
    <section>
      <MdxClient serialized={serialized} />
    </section>
  );
}
