import type { ReactNode } from "react"
import { cn } from "../lib/utils.js"

/* Server-compatible layout primitives (no hooks, no client code). */

export interface SlotProps {
  children?: ReactNode
  className?: string
}

/** Three-column docs shell: sidebar · content · table of contents. */
export function DocsLayout({ children, className }: SlotProps) {
  return (
    <div
      data-slot="docs-layout"
      className={cn(
        "mx-auto grid w-full max-w-[90rem] grid-cols-[minmax(0,1fr)] lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_15rem]",
        className
      )}
    >
      {children}
    </div>
  )
}

/** Sticky, scrollable sidebar column (hidden below `lg`). */
export function DocsSidebar({ children, className }: SlotProps) {
  return (
    <aside
      data-slot="docs-sidebar"
      className={cn(
        "sticky top-[var(--aria-header-height,0px)] hidden h-[calc(100dvh-var(--aria-header-height,0px))] overflow-y-auto border-r px-4 py-8 lg:block",
        className
      )}
    >
      {children}
    </aside>
  )
}

/** Main content column. */
export function DocsContent({ children, className }: SlotProps) {
  return (
    <main data-slot="docs-content" className={cn("min-w-0 px-4 pt-8 pb-24 sm:px-8 lg:px-12 lg:pt-12", className)}>
      {children}
    </main>
  )
}

/** Sticky right column for the table of contents (hidden below `xl`). */
export function DocsAside({ children, className }: SlotProps) {
  return (
    <aside
      data-slot="docs-aside"
      className={cn(
        "sticky top-[var(--aria-header-height,0px)] hidden h-[calc(100dvh-var(--aria-header-height,0px))] overflow-y-auto py-12 pr-6 xl:block",
        className
      )}
    >
      {children}
    </aside>
  )
}

export function DocsPage({ children, className }: SlotProps) {
  return (
    <article data-slot="docs-page" className={cn("text-foreground mx-auto w-full max-w-3xl", className)}>
      {children}
    </article>
  )
}

export function DocsPageTitle({ children, className }: SlotProps) {
  return (
    <h1 data-slot="docs-page-title" className={cn("text-(length:--aria-text-2xl) leading-tight font-semibold tracking-tight", className)}>
      {children}
    </h1>
  )
}

export function DocsPageDescription({ children, className }: SlotProps) {
  return (
    <p data-slot="docs-page-description" className={cn("text-muted-foreground mt-3 text-(length:--aria-text-lg) leading-relaxed", className)}>
      {children}
    </p>
  )
}

/** Wraps rendered MDX with Tailwind Typography styles. */
export function DocsPageContent({ children, className }: SlotProps) {
  return (
    <div
      data-slot="docs-page-content"
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-none",
        // Rhythm
        "prose-p:leading-7 prose-li:my-1 prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-(length:--aria-text-xl) prose-h3:mt-8 prose-h3:text-(length:--aria-text-lg)",
        // Heading anchors (rehype-autolink-headings) shouldn't look like links
        "[&_:is(h1,h2,h3,h4,h5,h6)_a]:[color:inherit] [&_:is(h1,h2,h3,h4,h5,h6)_a]:[font-weight:inherit] [&_:is(h1,h2,h3,h4,h5,h6)_a]:no-underline",
        // Links
        "prose-a:font-medium prose-a:underline-offset-4 prose-a:decoration-foreground/30 prose-a:hover:decoration-foreground",
        // Inline code
        "prose-code:before:content-none prose-code:after:content-none prose-code:rounded-md prose-code:border prose-code:bg-muted/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:font-normal prose-code:font-mono prose-pre:font-mono",
        "[&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-(length:--aria-text-code)",
        // Code blocks
        "prose-pre:rounded-xl prose-pre:border prose-pre:bg-[var(--aria-code-background)] prose-pre:text-foreground prose-pre:leading-relaxed",
        // Tables
        "prose-table:text-(length:--aria-text-sm) prose-th:font-medium prose-th:text-foreground prose-td:py-2.5 prose-table:my-0",
        "mt-10",
        className
      )}
    >
      {children}
    </div>
  )
}
