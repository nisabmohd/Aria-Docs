"use client"

import { useEffect, useState } from "react"
import type { TocItem } from "@ariadocs/core"
import { AlignLeft } from "lucide-react"
import { cn } from "../lib/utils.js"

export interface DocsTocProps {
  /** Headings from `docs.parse()` / `getToc()`. */
  items: TocItem[]
  title?: string
  className?: string
}

/** "On this page" list that highlights the heading currently in view. */
export function DocsToc({ items, title = "On this page", className }: DocsTocProps) {
  const active = useActiveHeading(items)
  if (items.length === 0) return null

  const minDepth = Math.min(...items.map((item) => item.depth))

  return (
    <nav data-slot="docs-toc" aria-label={title} className={cn("text-(length:--aria-text-sm)", className)}>
      <p className="text-muted-foreground mb-3 flex items-center gap-1.5 text-(length:--aria-text-sm)">
        <AlignLeft className="size-3.5" />
        {title}
      </p>
      <ul className="border-border space-y-0.5 border-l">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              style={{ paddingLeft: `${0.75 + (item.depth - minDepth) * 0.75}rem` }}
              className={cn(
                "-ml-px block border-l py-1 pr-2 text-(length:--aria-text-sm) leading-snug transition-colors",
                active === item.href
                  ? "border-[var(--aria-accent)] text-[var(--aria-accent)]"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              )}
            >
              {item.value}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function useActiveHeading(items: TocItem[]): string | undefined {
  const [active, setActive] = useState<string | undefined>(items[0]?.href)

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return
    const elements = items
      .map((item) => document.getElementById(safeDecode(item.href.replace(/^#/, ""))))
      .filter((element): element is HTMLElement => element !== null)
    if (elements.length === 0) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const first = elements.find((element) => visible.has(element.id))
        if (first !== undefined) setActive(`#${first.id}`)
      },
      { rootMargin: "0px 0px -70% 0px" }
    )
    for (const element of elements) observer.observe(element)
    return () => observer.disconnect()
  }, [items])

  return active
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
