import Link from "next/link"
import { getOperationTitle } from "@ariadocs/openapi"
import { MethodBadge, OpenAPI } from "@ariadocs/components"
import { PageNav } from "@/components/page-footer"
import { openapi, REFERENCE_BASE } from "@/lib/source"

export const metadata = { title: "Overview" }

export default async function ReferenceOverview() {
  const api = await openapi.parse()
  const first = api.operations[0]

  return (
    <div className="mx-auto max-w-3xl px-5 pt-10 pb-24 sm:px-10 lg:pt-14">
      <p className="text-muted-foreground mb-6 text-sm">
        This reference renders three endpoints from{" "}
        <a href="https://github.com/resend/resend-openapi" className="text-foreground underline underline-offset-4">
          Resend&apos;s public OpenAPI spec
        </a>{" "}
        (MIT) with <code className="font-mono text-[13px]">@ariadocs/openapi</code> and{" "}
        <code className="font-mono text-[13px]">@ariadocs/components</code>. It is an example, not Resend&apos;s official
        documentation.
      </p>

      <OpenAPI.Info />

      <div className="mt-14 space-y-12">
        {api.tags.map((tag) => (
          <section key={tag.id} id={tag.id} className="scroll-mt-20">
            <h2 className="text-xl font-semibold tracking-tight">
              <a href={`#${tag.id}`} className="hover:underline hover:underline-offset-4">
                {tag.title}
              </a>
            </h2>
            <OpenAPI.Markdown className="mt-1">{tag.description}</OpenAPI.Markdown>
            <ul className="mt-4 divide-y border-y">
              {tag.operations.map((operation) => (
                <li key={operation.id}>
                  <Link
                    href={`${REFERENCE_BASE}/${operation.id}`}
                    className="hover:bg-muted/40 flex items-baseline gap-3 px-1 py-2.5 transition-colors"
                  >
                    <MethodBadge method={operation.method} size="sm" variant="text" />
                    <span className="min-w-0 flex-1 truncate text-sm">{getOperationTitle(operation)}</span>
                    <code className="text-muted-foreground hidden truncate font-mono text-xs sm:block">{operation.path}</code>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <PageNav
        next={first === undefined ? undefined : { title: getOperationTitle(first), href: `${REFERENCE_BASE}/${first.id}` }}
      />
    </div>
  )
}
