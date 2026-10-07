import type { ReactNode } from "react"
import { isExternalUrl, sanitizeUrl } from "@ariadocs/core"
import { CodeBlock } from "./code/code-block.js"
import { cn } from "./lib/utils.js"

export interface MarkdownProps {
  /** CommonMark-ish text, e.g. an OpenAPI `description`. */
  children?: string
  className?: string
}

/**
 * Renders the Markdown subset used in API descriptions: paragraphs,
 * headings, lists, fenced code, `inline code`, **bold**, *italic* and
 * [links](https://…).
 *
 * Built from React elements only — raw HTML in the text is shown as text,
 * and link URLs go through `sanitizeUrl`, so a hostile spec can't inject
 * markup or `javascript:` links. Works in Server and Client Components.
 */
export function Markdown({ children, className }: MarkdownProps) {
  if (children === undefined || children.trim() === "") return null

  return (
    <div data-slot="markdown" className={cn("text-muted-foreground space-y-3 text-(length:--aria-text-sm) leading-relaxed", className)}>
      {parseBlocks(children)}
    </div>
  )
}

function parseBlocks(text: string): ReactNode[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n")
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ""

    if (line.trim() === "") {
      index += 1
      continue
    }

    const fence = /^\s*(```|~~~)\s*([\w-]*)/.exec(line)
    if (fence !== null) {
      const code: string[] = []
      index += 1
      while (index < lines.length && !(lines[index] ?? "").trim().startsWith(fence[1] ?? "```")) {
        code.push(lines[index] ?? "")
        index += 1
      }
      index += 1
      blocks.push(<CodeBlock key={blocks.length} code={code.join("\n")} language={fence[2] || undefined} />)
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading !== null) {
      blocks.push(
        <p key={blocks.length} className="text-foreground font-semibold">
          {parseInline(heading[2] ?? "")}
        </p>
      )
      index += 1
      continue
    }

    if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
      const ordered = /^\s*\d/.test(line)
      const items: string[] = []
      while (index < lines.length && /^\s*([-*+]|\d+[.)])\s+/.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\s*([-*+]|\d+[.)])\s+/, ""))
        index += 1
      }
      const List = ordered ? "ol" : "ul"
      blocks.push(
        <List key={blocks.length} className={cn("space-y-1 pl-5", ordered ? "list-decimal" : "list-disc")}>
          {items.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </List>
      )
      continue
    }

    const paragraph: string[] = []
    while (
      index < lines.length &&
      (lines[index] ?? "").trim() !== "" &&
      !/^\s*(```|~~~|#{1,6}\s|[-*+]\s|\d+[.)]\s)/.test(lines[index] ?? "")
    ) {
      paragraph.push((lines[index] ?? "").trim())
      index += 1
    }
    blocks.push(<p key={blocks.length}>{parseInline(paragraph.join(" "))}</p>)
  }

  return blocks
}

const INLINE =
  /`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|_([^_\s][^_]*)_|\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)(?:\s+"[^"]*")?\)|<(https?:\/\/[^>\s]+)>/g

export function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0

  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0
    if (start > last) nodes.push(text.slice(last, start))
    const key = nodes.length

    const [, code, bold1, bold2, italic1, italic2, label, href, autolink] = match
    if (code !== undefined) {
      nodes.push(
        <code key={key} className="bg-muted text-foreground rounded px-1 py-0.5 font-mono text-[0.85em]">
          {code}
        </code>
      )
    } else if (bold1 !== undefined || bold2 !== undefined) {
      nodes.push(
        <strong key={key} className="text-foreground font-semibold">
          {parseInline(bold1 ?? bold2 ?? "")}
        </strong>
      )
    } else if (italic1 !== undefined || italic2 !== undefined) {
      nodes.push(<em key={key}>{parseInline(italic1 ?? italic2 ?? "")}</em>)
    } else {
      nodes.push(<SafeLink key={key} href={href ?? autolink} label={label ?? autolink ?? ""} />)
    }
    last = start + match[0].length
  }

  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function SafeLink({ href, label }: { href?: string; label: string }) {
  const safe = sanitizeUrl(href)
  if (safe === undefined) return <>{label}</>
  const external = isExternalUrl(safe)
  return (
    <a
      href={safe}
      className="text-foreground font-medium underline underline-offset-4"
      {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
    >
      {parseInline(label)}
    </a>
  )
}
