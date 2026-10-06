import { openapi } from "@ariadocs/openapi";
import { OpenAPI } from "@ariadocs/components";
import spec from "@/contents/openapi/ariadocs-api.json";
import "@ariadocs/components/styles/openapi.css";

export const metadata = {
  title: "API Reference",
  description:
    "Interactive API reference for the Aria-Docs demo API, rendered from an OpenAPI document with @ariadocs/openapi and @ariadocs/components.",
};

export default async function ApiDocsPage() {
  const api = await openapi.parse(spec);

  return (
    <div className="not-prose py-4">
      <OpenAPI.Root api={api}>
        <OpenAPI.Docs />
      </OpenAPI.Root>
    </div>
  );
}
