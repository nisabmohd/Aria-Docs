import { OpenAPI } from "@ariadocs/components"
import { openapi, REFERENCE_BASE } from "@/lib/source"

export const metadata = { title: { default: "API Reference", template: "%s · API Reference" } }

export default async function ReferenceLayout({ children }: { children: React.ReactNode }) {
  const api = await openapi.parse()
  return (
    <OpenAPI.Root api={api} operationBaseHref={REFERENCE_BASE}>
      {children}
    </OpenAPI.Root>
  )
}
