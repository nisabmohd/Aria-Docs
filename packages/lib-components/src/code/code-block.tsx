"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Check, Copy } from "lucide-react"
import { tokenize } from "../lib/highlight.js"
import { cn } from "../lib/utils.js"

export interface CopyButtonProps {
  /** Text to copy, or a function returning it (evaluated on click). */
  value: string | (() => string)
  className?: string
}

/** A small copy-to-clipboard button. */
export function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timeout.current), [])

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      data-slot="copy-button"
      className={cn(
        "text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-7 items-center justify-center rounded-md transition-colors",
        className
      )}
      onClick={() => {
        const text = typeof value === "function" ? value() : value
        void navigator.clipboard?.writeText(text).then(() => {
          setCopied(true)
          clearTimeout(timeout.current)
          timeout.current = setTimeout(() => setCopied(false), 1500)
        })
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  )
}

export interface CodeBlockProps {
  code: string
  /** `json`, `bash`, `javascript`, `python` are highlighted; anything else renders plain. */
  language?: string
  /** Label in the header: a file name, or a caption next to the tabs. */
  title?: ReactNode
  /** Tabs or other controls, shown on the left of the header. */
  actions?: ReactNode
  className?: string
}

/** A code block with a header, Prism-compatible highlighting and a copy button. */
export function CodeBlock({ code, language, title, actions, className }: CodeBlockProps) {
  return (
    <figure
      data-slot="code-block"
      className={cn("bg-[var(--aria-code-background)] overflow-hidden rounded-xl border text-(length:--aria-text-sm)", className)}
    >
      <figcaption className="flex h-10 items-center gap-2 border-b pr-1.5 pl-1">
        {actions !== undefined ? (
          <div className="flex h-full min-w-0 flex-1 items-center">{actions}</div>
        ) : null}
        <span
          className={cn(
            "text-muted-foreground truncate font-mono text-(length:--aria-text-xs)",
            actions === undefined ? "min-w-0 flex-1 pl-3" : "shrink-0"
          )}
        >
          {title ?? (actions === undefined ? (language ?? "code") : null)}
        </span>
        <CopyButton value={code} />
      </figcaption>
      <pre className="max-h-[32rem] overflow-auto p-4 font-mono text-(length:--aria-text-code) leading-relaxed">
        <code className={cn("font-mono", language !== undefined && `language-${language}`)}>
          <Highlighted code={code} language={language} />
        </code>
      </pre>
    </figure>
  )
}

export interface CodeTabsProps<T extends string> {
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (value: T) => void
  /** Accessible name for the tab list. */
  label?: string
}

/** Underlined tabs for code block headers. */
export function CodeTabs<T extends string>({ value, options, onChange, label }: CodeTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex h-full min-w-0 items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "-mb-px shrink-0 border-b px-2.5 text-(length:--aria-text-sm) whitespace-nowrap transition-colors",
            option.value === value
              ? "border-foreground text-foreground"
              : "text-muted-foreground hover:text-foreground border-transparent"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function Highlighted({ code, language }: { code: string; language?: string }) {
  return (
    <>
      {tokenize(code, language).map((token, index) =>
        token.type === undefined ? (
          token.value
        ) : (
          <span key={index} className={`token ${token.type}`}>
            {token.value}
          </span>
        )
      )}
    </>
  )
}
