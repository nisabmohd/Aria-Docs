import { cn } from "../lib/utils.js"

const KNOWN = new Set(["get", "post", "put", "patch", "delete", "head", "options", "trace"])

export interface MethodBadgeProps {
  /** HTTP method, any case. */
  method: string
  size?: "sm" | "md"
  /** `badge`: tinted pill. `text`: colored label only (sidebars, URL bars). */
  variant?: "badge" | "text"
  className?: string
}

/** Colored HTTP method label (`--aria-method-*` variables). Server-compatible. */
export function MethodBadge({ method, size = "md", variant = "badge", className }: MethodBadgeProps) {
  const key = method.toLowerCase()
  const color = KNOWN.has(key) ? `var(--aria-method-${key})` : "var(--muted-foreground)"
  const label = size === "sm" && key === "delete" ? "DEL" : size === "sm" && key === "options" ? "OPT" : method.toUpperCase()

  if (variant === "text") {
    return (
      <span
        data-slot="openapi-method"
        data-method={key}
        className={cn("shrink-0 font-mono font-medium", size === "sm" ? "w-[6ch] text-(length:--aria-text-xs)" : "text-(length:--aria-text-sm)", className)}
        style={{ color }}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      data-slot="openapi-method"
      data-method={key}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-mono font-semibold",
        size === "sm" ? "h-[1.6em] w-[6.5ch] text-(length:--aria-text-xs)" : "h-6 px-2 text-(length:--aria-text-xs)",
        className
      )}
      style={{ color, backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)` }}
    >
      {label}
    </span>
  )
}
