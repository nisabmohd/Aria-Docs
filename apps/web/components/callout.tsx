import type { ReactNode } from "react"
import { AlertTriangle, Info, Lightbulb, ShieldAlert } from "lucide-react"
import { cn } from "@ariadocs/components"

const STYLES = {
  info: { icon: Info, className: "border-blue-500/30 bg-blue-500/5 [&_svg]:text-blue-500" },
  tip: { icon: Lightbulb, className: "border-emerald-500/30 bg-emerald-500/5 [&_svg]:text-emerald-500" },
  warning: { icon: AlertTriangle, className: "border-amber-500/30 bg-amber-500/5 [&_svg]:text-amber-500" },
  danger: { icon: ShieldAlert, className: "border-red-500/30 bg-red-500/5 [&_svg]:text-red-500" },
}

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: keyof typeof STYLES
  title?: string
  children?: ReactNode
}) {
  const { icon: Icon, className } = STYLES[type]
  return (
    <div className={cn("not-prose my-6 flex gap-3 rounded-xl border p-4 text-sm", className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="text-muted-foreground min-w-0 space-y-1 [&_a]:underline [&_code]:font-mono [&_code]:text-[0.85em] [&_strong]:text-foreground">
        {title !== undefined ? <p className="text-foreground text-sm font-medium">{title}</p> : null}
        <div className="[&>p]:m-0">{children}</div>
      </div>
    </div>
  )
}

export function Cards({ children }: { children?: ReactNode }) {
  return <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">{children}</div>
}

export function Card({ title, href, children }: { title: string; href: string; children?: ReactNode }) {
  return (
    <a
      href={href}
      className="hover:bg-muted/50 block rounded-xl border p-4 no-underline transition-colors"
    >
      <p className="text-foreground text-sm font-medium">{title}</p>
      {children !== undefined ? <p className="text-muted-foreground mt-1 text-sm">{children}</p> : null}
    </a>
  )
}
