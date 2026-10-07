import { OpenAPI } from "@ariadocs/components"
import { openapi } from "@/lib/source"

export const metadata = { title: "Schemas" }

export default async function SchemasPage() {
  const api = await openapi.parse()

  return (
    <div className="mx-auto max-w-3xl px-5 pt-10 pb-24 sm:px-10 lg:pt-14">
      <h1 className="text-[2rem] leading-tight font-semibold tracking-tight">Schemas</h1>
      <p className="text-muted-foreground mt-3 text-lg">
        Reusable models from <code className="font-mono text-base">components.schemas</code>.
      </p>
      <div className="mt-10 divide-y border-y">
        {Object.entries(api.schemas).map(([name, schema]) => (
          <section key={name} className="py-6">
            <OpenAPI.Schema schema={schema} name={name}>
              <OpenAPI.Schema.Title id={name} className="mb-2" />
              <OpenAPI.Schema.Description />
              <OpenAPI.Schema.Properties mode="response" />
            </OpenAPI.Schema>
          </section>
        ))}
      </div>
    </div>
  )
}
