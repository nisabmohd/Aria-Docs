"use client"

import { useEffect, useState, type ComponentType, type ReactNode } from "react"
import type { NavItem } from "@ariadocs/core"
import { isExternalUrl } from "@ariadocs/core"
import { ChevronRight } from "lucide-react"
import { cn } from "../lib/utils.js"
import { MethodBadge } from "../openapi/method.js"

export interface LinkComponentProps {
  href: string
  className?: string
  children?: ReactNode
  onClick?: () => void
  "aria-current"?: "page"
}

export interface DocsNavProps {
  /** Navigation from `docs.getNavigation()` or `getNavigation(api)`. */
  items: NavItem[]
  /** The current URL path; matching items are highlighted and their sections opened. */
  activeHref?: string
  /** Prefix added to every relative `href` (e.g. `"/docs"`). */
  baseHref?: string
  /**
   * Link component, e.g. Next.js `Link`, for client-side navigation. Pass it
   * from a Client Component (functions can't cross the server boundary).
   */
  linkAs?: ComponentType<LinkComponentProps>
  /** Called after a link is clicked (e.g. to close a mobile drawer). */
  onNavigate?: () => void
  className?: string
}

/**
 * Sidebar navigation for the shared `NavItem` tree. Top-level folders become
 * section headings; deeper folders collapse. Items with a `badge` (HTTP
 * methods from `@ariadocs/openapi`) show it next to the title.
 */
export function DocsNav({ items, activeHref, baseHref = "", linkAs, onNavigate, className }: DocsNavProps) {
  const context: NavContext = { activeHref, baseHref, Link: linkAs ?? DefaultLink, onNavigate }

  return (
    <nav data-slot="docs-nav" className={cn("text-(length:--aria-text-sm)", className)}>
      <ul className="space-y-0.5">
        {items
          .filter((item) => item.nav)
          .map((item) =>
            item.items.length > 0 ? (
              <li key={item.href} className="pt-6 first:pt-0">
                <p className="text-foreground mb-1.5 px-2 text-(length:--aria-text-sm) font-medium">{item.title}</p>
                <NavList items={item.items} context={context} depth={1} />
              </li>
            ) : (
              <NavLink key={item.href} item={item} context={context} />
            )
          )}
      </ul>
    </nav>
  )
}

interface NavContext {
  activeHref?: string
  baseHref: string
  Link: ComponentType<LinkComponentProps>
  onNavigate?: () => void
}

function resolveHref(href: string, baseHref: string): string {
  if (isExternalUrl(href) || href.startsWith("#") || baseHref === "") return href
  const base = baseHref.replace(/\/+$/, "")
  // The index page ("/") links to the base itself: "/docs", not "/docs/".
  if (href === "/" || href === "") return base || "/"
  return `${base}${href.startsWith("/") ? href : `/${href}`}`
}

function isActive(item: NavItem, context: NavContext): boolean {
  if (context.activeHref === undefined) return false
  const href = resolveHref(item.href, context.baseHref)
  return context.activeHref === href || context.activeHref.replace(/\/+$/, "") === href.replace(/\/+$/, "")
}

function containsActive(item: NavItem, context: NavContext): boolean {
  return isActive(item, context) || item.items.some((child) => containsActive(child, context))
}

function NavList({ items, context, depth }: { items: NavItem[]; context: NavContext; depth: number }) {
  return (
    <ul className={cn("space-y-px", depth > 1 && "border-border ml-3 border-l pl-2")}>
      {items
        .filter((item) => item.nav)
        .map((item) =>
          item.items.length > 0 ? (
            <NavFolder key={item.href} item={item} context={context} depth={depth} />
          ) : (
            <NavLink key={item.href} item={item} context={context} />
          )
        )}
    </ul>
  )
}

function NavFolder({ item, context, depth }: { item: NavItem; context: NavContext; depth: number }) {
  const hasActive = containsActive(item, context)
  const [open, setOpen] = useState(hasActive)

  // Open the folder when navigation moves into it.
  useEffect(() => {
    if (hasActive) setOpen(true)
  }, [hasActive])

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="text-muted-foreground hover:text-foreground flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors"
      >
        <span className="flex-1 truncate">{item.title}</span>
        <ChevronRight className={cn("size-3.5 shrink-0 transition-transform", open && "rotate-90")} />
      </button>
      {open ? <NavList items={item.items} context={context} depth={depth + 1} /> : null}
    </li>
  )
}

function NavLink({ item, context }: { item: NavItem; context: NavContext }) {
  const active = isActive(item, context)
  const { Link } = context
  return (
    <li>
      <Link
        href={resolveHref(item.href, context.baseHref)}
        onClick={context.onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
          active
            ? "bg-[color-mix(in_oklab,var(--aria-accent)_12%,transparent)] font-medium text-[var(--aria-accent)]"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {item.badge !== undefined ? <MethodBadge method={item.badge} size="sm" variant="text" /> : null}
        <span className="min-w-0 flex-1 truncate">{item.title}</span>
      </Link>
    </li>
  )
}

function DefaultLink({ href, children, ...props }: LinkComponentProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}
