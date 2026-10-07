"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { CornerDownLeft, FileText, Search } from "lucide-react"
import { cn, MethodBadge } from "@ariadocs/components"
import type { SearchEntry } from "@/lib/search-index"

const SearchContext = createContext<() => void>(() => {})

/** Holds the ⌘K dialog; any `SearchButton` below can open it. */
export function SearchProvider({ entries, children }: { entries: SearchEntry[]; children: ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <SearchContext.Provider value={() => setOpen(true)}>
      {children}
      {open ? <SearchDialog entries={entries} onClose={() => setOpen(false)} /> : null}
    </SearchContext.Provider>
  )
}

export function SearchButton({ compact = false, className }: { compact?: boolean; className?: string }) {
  const open = useContext(SearchContext)

  if (compact) {
    return (
      <button
        type="button"
        aria-label="Search"
        onClick={open}
        className={cn(
          "text-muted-foreground hover:text-foreground inline-flex size-10 items-center justify-center rounded-md transition-colors",
          className
        )}
      >
        <Search className="size-[18px]" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "text-muted-foreground hover:text-foreground bg-card flex h-9 w-full items-center gap-2 rounded-lg border px-2.5 text-[13px] transition-colors",
        className
      )}
    >
      <Search className="size-[15px]" />
      <span className="flex-1 text-left">Search</span>
      <kbd className="text-muted-foreground font-mono text-[11px]">⌘K</kbd>
    </button>
  )
}

function SearchDialog({ entries, onClose }: { entries: SearchEntry[]; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const results = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (terms.length === 0) return entries.filter((entry) => entry.section === "Documentation").slice(0, 8)
    return entries
      .map((entry) => {
        const title = entry.title.toLowerCase()
        const text = `${title} ${entry.group ?? ""} ${entry.section} ${entry.keywords ?? ""}`.toLowerCase()
        if (!terms.every((term) => text.includes(term))) return undefined
        const first = terms[0] ?? ""
        return { entry, score: (title.startsWith(first) ? 0 : 1) + (title.includes(first) ? 0 : 1) }
      })
      .filter((item) => item !== undefined)
      .sort((a, b) => a.score - b.score)
      .slice(0, 30)
      .map((item) => item.entry)
  }, [entries, query])

  useEffect(() => setActive(0), [query])
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [active])

  const go = (entry?: SearchEntry) => {
    if (entry === undefined) return
    onClose()
    router.push(entry.href)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="bg-popover text-popover-foreground relative w-full max-w-xl overflow-hidden rounded-xl border shadow-2xl">
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="text-muted-foreground size-4" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault()
                setActive((i) => Math.min(i + 1, results.length - 1))
              } else if (event.key === "ArrowUp") {
                event.preventDefault()
                setActive((i) => Math.max(i - 1, 0))
              } else if (event.key === "Enter") {
                go(results[active])
              } else if (event.key === "Escape") {
                onClose()
              }
            }}
            aria-label="Search"
            placeholder="Search docs, components and endpoints"
            className="placeholder:text-muted-foreground h-12 flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="text-muted-foreground rounded border px-1.5 font-mono text-[10px]">Esc</kbd>
        </div>
        <ul ref={listRef} className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="text-muted-foreground px-3 py-8 text-center text-sm">No results for “{query}”</li>
          ) : (
            results.map((entry, index) => (
              <li key={entry.href} data-index={index}>
                <button
                  type="button"
                  onMouseMove={() => setActive(index)}
                  onClick={() => go(entry)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm",
                    index === active ? "bg-muted text-foreground" : "text-muted-foreground"
                  )}
                >
                  {entry.badge !== undefined ? (
                    <MethodBadge method={entry.badge} size="sm" variant="text" />
                  ) : (
                    <FileText className="size-4 shrink-0 opacity-60" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground block truncate">{entry.title}</span>
                    <span className="block truncate text-xs">
                      {entry.section}
                      {entry.group !== undefined ? ` · ${entry.group}` : ""}
                    </span>
                  </span>
                  {index === active ? <CornerDownLeft className="size-3.5 opacity-60" /> : null}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
