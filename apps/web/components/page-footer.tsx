import Link from "next/link"
import type { PageLink } from "@/lib/navigation"

/** Previous / Next cards at the end of a page. */
export function PageNav({ previous, next }: { previous?: PageLink; next?: PageLink }) {
  if (previous === undefined && next === undefined) return null

  return (
    <nav aria-label="Pagination" className="not-prose mt-16 grid gap-3 sm:grid-cols-2">
      {previous !== undefined ? (
        <Link href={previous.href} className="hover:bg-muted/50 flex flex-col gap-1 rounded-xl border px-4 py-3.5 transition-colors">
          <span className="text-muted-foreground text-[13px]">Previous</span>
          <span className="font-medium">← {previous.title}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next !== undefined ? (
        <Link
          href={next.href}
          className="hover:bg-muted/50 flex flex-col items-end gap-1 rounded-xl border px-4 py-3.5 text-right transition-colors"
        >
          <span className="text-muted-foreground text-[13px]">Next</span>
          <span className="font-medium">{next.title} →</span>
        </Link>
      ) : null}
    </nav>
  )
}
