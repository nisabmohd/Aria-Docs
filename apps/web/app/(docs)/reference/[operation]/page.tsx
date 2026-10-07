import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getOperationTitle, type APIOperation } from "@ariadocs/openapi"
import { OpenAPI } from "@ariadocs/components"
import { PageNav } from "@/components/page-footer"
import { openapi, REFERENCE_BASE } from "@/lib/source"

type Props = { params: Promise<{ operation: string }> }

function link(operation?: APIOperation) {
  return operation === undefined
    ? undefined
    : { title: getOperationTitle(operation), href: `${REFERENCE_BASE}/${operation.id}` }
}

export default async function OperationPage({ params }: Props) {
  const { operation: id } = await params
  const api = await openapi.parse()
  // Sidebar order: by tag, then operation.
  const ordered = api.tags.flatMap((tag) => tag.operations)
  const index = ordered.findIndex((operation) => operation.id === id)
  const operation = ordered[index]
  if (operation === undefined) notFound()

  return (
    <div className="mx-auto max-w-[76rem] px-5 pt-10 pb-24 sm:px-10 lg:pt-14">
      <OpenAPI.Operation operation={operation} headingLevel={1} />
      <div className="max-w-3xl">
        <PageNav previous={link(ordered[index - 1])} next={link(ordered[index + 1])} />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const operation = await openapi.getOperation((await params).operation)
  return operation === undefined
    ? {}
    : { title: getOperationTitle(operation), description: operation.description?.split("\n")[0] }
}

export async function generateStaticParams() {
  const paths = await openapi.getPagePaths()
  return paths.map((path) => ({ operation: path.slice(1) }))
}

export const dynamicParams = false
