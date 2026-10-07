"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@ariadocs/components"

/** Light / dark segmented switch. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const current = mounted ? resolvedTheme : undefined

  return (
    <div role="radiogroup" aria-label="Theme" className={cn("flex rounded-full border p-0.5", className)}>
      {(
        [
          { value: "light", label: "Light theme", Icon: Sun },
          { value: "dark", label: "Dark theme", Icon: Moon },
        ] as const
      ).map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={current === value}
          aria-label={label}
          onClick={() => setTheme(value)}
          className={cn(
            "inline-flex h-6 w-7 items-center justify-center rounded-full transition-colors",
            current === value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  )
}
