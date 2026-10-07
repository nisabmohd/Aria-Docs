import { cn } from "@ariadocs/components"

/** The Ariadocs mark: an A built from two pieces. Colors follow the theme. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="6 6 36 36" aria-hidden className={cn("size-5 shrink-0", className)}>
      <path d="M8 40 L20 8 H27 L15 40 Z" className="fill-foreground" />
      <path d="M21 40 L28 21 L40 40 Z" className="fill-muted-foreground" />
    </svg>
  )
}

/** Mark + name, used in the header, sidebar and footer. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark />
      Ariadocs
    </span>
  )
}
