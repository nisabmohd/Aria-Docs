import type { ReactNode } from "react"
import { cn } from "../lib/utils.js"

export interface OpenAPILayoutProps {
  children?: ReactNode
  className?: string
}

/**
 * `<OpenAPI.Layout>` — the docs shell: sidebar slot + content slot side by side.
 */
export function OpenAPILayout({ children, className }: OpenAPILayoutProps) {
  return (
    <div
      data-slot="openapi-layout"
      className={cn("flex flex-col gap-8 lg:flex-row lg:gap-10", className)}
    >
      {children}
    </div>
  )
}

export interface OpenAPIContentProps {
  children?: ReactNode
  className?: string
}

/**
 * `<OpenAPI.Content>` — the main content column.
 */
export function OpenAPIContent({ children, className }: OpenAPIContentProps) {
  return (
    <main
      data-slot="openapi-content"
      className={cn("min-w-0 flex-1 space-y-10", className)}
    >
      {children}
    </main>
  )
}
