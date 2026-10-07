import { DocsSidebar } from "@/components/docs-sidebar"
import { getSidebar } from "@/lib/navigation"

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const items = await getSidebar()

  return (
    <div className="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <DocsSidebar items={items} />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
