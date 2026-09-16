"use client"

import type { ReactNode } from "react"
import type { APINavigationGroup, APINavigationItem, HTTPMethod } from "@ariadocs/openapi"
import { cn } from "../lib/utils.js"
import { useOpenAPIContext } from "./context.js"

export interface OpenAPISidebarProps {
  children?: ReactNode
  className?: string
}

/**
 * `<OpenAPI.Sidebar>` — navigation built from `api.groups`. Render it bare for
 * the working default, or compose with `.Group` / `.Item` for full control.
 */
export function OpenAPISidebar({ children, className }: OpenAPISidebarProps) {
  const { navigation } = useOpenAPIContext()

  return (
    <aside
      data-slot="openapi-sidebar"
      className={cn("w-full shrink-0 lg:sticky lg:top-0 lg:w-64 lg:self-start", className)}
    >
      {children ?? (
        <nav className="space-y-6">
          {navigation.groups.map((group) => (
            <OpenAPISidebarGroup key={group.id} group={group} />
          ))}
        </nav>
      )}
    </aside>
  )
}

export interface OpenAPISidebarGroupProps {
  group?: APINavigationGroup
  title?: string
  children?: ReactNode
  className?: string
}

export function OpenAPISidebarGroup({
  group,
  title,
  children,
  className,
}: OpenAPISidebarGroupProps) {
  return (
    <div data-slot="openapi-sidebar-group" className={cn("space-y-1", className)}>
      <div className="text-foreground font-semibold">{title ?? group?.title}</div>
      <div className="space-y-0.5">
        {children ??
          group?.items.map((item) => (
            <OpenAPISidebarItem key={item.id} item={item} />
          ))}
      </div>
    </div>
  )
}

export interface OpenAPISidebarItemProps {
  item?: APINavigationItem
  title?: string
  href?: string
  method?: HTTPMethod
  className?: string
}

export function OpenAPISidebarItem({
  item,
  title,
  href,
  method,
  className,
}: OpenAPISidebarItemProps) {
  const target = href ?? (item !== undefined ? `#${item.id}` : undefined)

  return (
    <a
      data-slot="openapi-sidebar-item"
      href={target}
      className={cn(
        "text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors",
        className
      )}
    >
      {method ?? item?.method !== undefined ? (
        <span
          className="w-11 shrink-0 text-[10px] font-bold tracking-wide"
          style={{ color: `var(--aria-method-${(method ?? item?.method ?? "get").toLowerCase()})` }}
        >
          {method ?? item?.method}
        </span>
      ) : null}
      <span className="truncate">{title ?? item?.title}</span>
    </a>
  )
}
