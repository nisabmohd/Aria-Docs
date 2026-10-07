import type { ReactNode } from "react"
import { slugify } from "@ariadocs/core"
import { Hash } from "lucide-react"
import { cn } from "../lib/utils.js"

/**
 * A heading anchor id scoped to an operation, so several operations on one
 * page never share ids: `anchorId("emails-send", "Path Parameters")` →
 * `"emails-send-path-parameters"`.
 */
export function anchorId(scope: string | undefined, ...parts: string[]): string {
  const suffix = parts.map((part) => slugify(part, "section")).join("-")
  return scope === undefined ? suffix : `${scope}-${suffix}`
}

/** Makes its children a link to `#id`, with a `#` that appears on hover. Server-compatible. */
export function AnchorLink({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  if (id === undefined) return <>{children}</>
  return (
    <a
      href={`#${id}`}
      data-slot="anchor-link"
      className={cn("group/anchor inline-flex items-center gap-1.5 [color:inherit] no-underline", className)}
    >
      {children}
      <Hash
        aria-hidden
        className="text-muted-foreground size-[0.8em] shrink-0 opacity-0 transition-opacity group-hover/anchor:opacity-100 group-focus-visible/anchor:opacity-100"
      />
    </a>
  )
}
