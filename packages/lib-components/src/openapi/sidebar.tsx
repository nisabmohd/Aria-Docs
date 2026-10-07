"use client"

import { useMemo, type ComponentType } from "react"
import { getNavigation } from "@ariadocs/openapi"
import { DocsNav, type LinkComponentProps } from "../docs/nav.js"
import { useOpenAPI } from "./context.js"

export interface OpenAPISidebarProps {
  /** Highlight the item with this href. */
  activeHref?: string
  /** Link component (e.g. Next.js `Link`); pass from a Client Component. */
  linkAs?: ComponentType<LinkComponentProps>
  onNavigate?: () => void
  className?: string
}

/** `<OpenAPI.Sidebar>` — tags and their operations, as `DocsNav`. */
export function OpenAPISidebar({ activeHref, linkAs, onNavigate, className }: OpenAPISidebarProps) {
  const { api, getOperationHref } = useOpenAPI()
  const items = useMemo(() => getNavigation(api, { getOperationHref }), [api, getOperationHref])
  return <DocsNav items={items} activeHref={activeHref} linkAs={linkAs} onNavigate={onNavigate} className={className} />
}
