import type { ReactNode } from "react"
import { AnchorLink } from "./anchor.js"

/**
 * A titled block inside an operation (Parameters, Body, ...). With an `id`,
 * the heading links to itself. Server-compatible.
 */
export function Section({
  title,
  aside,
  children,
  className,
  id,
}: {
  title: ReactNode
  aside?: ReactNode
  children?: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section data-slot="openapi-section" className={className}>
      <div className="mb-1 flex items-baseline gap-2 border-b pb-2.5">
        <h3 id={id} className="text-foreground scroll-mt-24 text-(length:--aria-text-lg) font-semibold tracking-tight">
          <AnchorLink id={id}>{title}</AnchorLink>
        </h3>
        {aside !== undefined && aside !== null ? <div className="ml-auto flex items-baseline gap-2">{aside}</div> : null}
      </div>
      {children}
    </section>
  )
}
