import type { ReactNode } from "react"
import { cn } from "../lib/utils.js"

/**
 * `Docs.*` — layout primitives for MDX documentation pages. All components
 * are server-compatible (no hooks); drop `<MdxServer>` output into
 * `Docs.Page.Content`.
 */

export interface DocsRootProps {
  children?: ReactNode
  className?: string
}

export function DocsRoot({ children, className }: DocsRootProps) {
  return (
    <div data-slot="docs-root" className={cn("relative", className)}>
      {children}
    </div>
  )
}

export interface DocsLayoutProps {
  children?: ReactNode
  className?: string
}

export function DocsLayout({ children, className }: DocsLayoutProps) {
  return (
    <div
      data-slot="docs-layout"
      className={cn("flex flex-col gap-8 lg:flex-row lg:gap-10", className)}
    >
      {children}
    </div>
  )
}

export interface DocsSidebarProps {
  children?: ReactNode
  className?: string
}

export function DocsSidebar({ children, className }: DocsSidebarProps) {
  return (
    <aside
      data-slot="docs-sidebar"
      className={cn("w-full shrink-0 lg:sticky lg:top-0 lg:w-64 lg:self-start", className)}
    >
      {children}
    </aside>
  )
}

export interface DocsContentProps {
  children?: ReactNode
  className?: string
}

export function DocsContent({ children, className }: DocsContentProps) {
  return (
    <main data-slot="docs-content" className={cn("min-w-0 flex-1", className)}>
      {children}
    </main>
  )
}

export interface DocsPageProps {
  children?: ReactNode
  className?: string
}

export function DocsPage({ children, className }: DocsPageProps) {
  return (
    <article
      data-slot="docs-page"
      className={cn("text-foreground mx-auto max-w-3xl", className)}
    >
      {children}
    </article>
  )
}

export interface DocsPageTitleProps {
  children?: ReactNode
  className?: string
}

export function DocsPageTitle({ children, className }: DocsPageTitleProps) {
  return (
    <h1
      data-slot="docs-page-title"
      className={cn("mb-4 text-3xl font-bold tracking-tight", className)}
    >
      {children}
    </h1>
  )
}

export interface DocsPageDescriptionProps {
  children?: ReactNode
  className?: string
}

export function DocsPageDescription({ children, className }: DocsPageDescriptionProps) {
  return (
    <p
      data-slot="docs-page-description"
      className={cn("text-muted-foreground mb-8 text-lg leading-relaxed", className)}
    >
      {children}
    </p>
  )
}

export interface DocsPageContentProps {
  children?: ReactNode
  className?: string
}

export function DocsPageContent({ children, className }: DocsPageContentProps) {
  return (
    <div
      data-slot="docs-page-content"
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
    >
      {children}
    </div>
  )
}

/**
 * The `Docs` component namespace for `@ariadocs/components`.
 *
 * ```tsx
 * <Docs.Root>
 *   <Docs.Layout>
 *     <Docs.Sidebar>...</Docs.Sidebar>
 *     <Docs.Content>
 *       <Docs.Page>
 *         <Docs.Page.Title />
 *         <Docs.Page.Description />
 *         <Docs.Page.Content><MdxServer {...props} /></Docs.Page.Content>
 *       </Docs.Page>
 *     </Docs.Content>
 *   </Docs.Layout>
 * </Docs.Root>
 * ```
 */
export const Docs = Object.assign(DocsRoot, {
  Layout: DocsLayout,
  Sidebar: DocsSidebar,
  Content: DocsContent,
  Page: Object.assign(DocsPage, {
    Title: DocsPageTitle,
    Description: DocsPageDescription,
    Content: DocsPageContent,
  }),
})
