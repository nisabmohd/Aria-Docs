# MDX content components

`@ariadocs/components` has no Callout, Tabs, Steps or Cards. Copy these into the app (e.g. `components/mdx/`), change the paths to the project's alias, and register them. They use shadcn tokens and `lucide-react`, which `@ariadocs/components` already depends on.

## Register

```ts title="lib/docs.ts"
import { Pre } from "@ariadocs/components"
import { Callout } from "@/components/mdx/callout"
import { Card, Cards } from "@/components/mdx/cards"
import { Step, Steps } from "@/components/mdx/steps"
import { Tab, Tabs } from "@/components/mdx/tabs"

export const docs = createDocs({
  contentDir: "content/docs",
  components: { pre: Pre, Callout, Cards, Card, Steps, Step, Tabs, Tab },
  // ...plugins
})
```

With client rendering, pass the same map: `<MdxClient serialized={serialized} components={mdxComponents} />`.

## Callout

```tsx title="components/mdx/callout.tsx"
import type { ReactNode } from "react"
import { AlertTriangle, Info, Lightbulb, ShieldAlert } from "lucide-react"
import { cn } from "@ariadocs/components"

const STYLES = {
  info: { icon: Info, className: "border-blue-500/30 bg-blue-500/5 [&_svg]:text-blue-500" },
  tip: { icon: Lightbulb, className: "border-emerald-500/30 bg-emerald-500/5 [&_svg]:text-emerald-500" },
  warning: { icon: AlertTriangle, className: "border-amber-500/30 bg-amber-500/5 [&_svg]:text-amber-500" },
  danger: { icon: ShieldAlert, className: "border-red-500/30 bg-red-500/5 [&_svg]:text-red-500" },
}

export function Callout({ type = "info", title, children }: { type?: keyof typeof STYLES; title?: string; children?: ReactNode }) {
  const { icon: Icon, className } = STYLES[type]
  return (
    <div className={cn("not-prose my-6 flex gap-3 rounded-xl border p-4 text-sm", className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="text-muted-foreground min-w-0 space-y-1 [&_a]:underline [&_code]:font-mono [&_strong]:text-foreground">
        {title !== undefined ? <p className="text-foreground font-medium">{title}</p> : null}
        <div className="[&>p]:m-0">{children}</div>
      </div>
    </div>
  )
}
```

```mdx
<Callout type="warning" title="Heads up">
  This deletes the file.
</Callout>
```

## Cards

```tsx title="components/mdx/cards.tsx"
import type { ReactNode } from "react"

export function Cards({ children }: { children?: ReactNode }) {
  return <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">{children}</div>
}

export function Card({ title, href, children }: { title: string; href: string; children?: ReactNode }) {
  return (
    <a href={href} className="hover:bg-muted/50 block rounded-xl border p-4 transition-colors">
      <p className="text-foreground text-sm font-medium">{title}</p>
      {children !== undefined ? <p className="text-muted-foreground mt-1 text-sm">{children}</p> : null}
    </a>
  )
}
```

```mdx
<Cards>
  <Card title="Installation" href="/docs/installation">Add the packages.</Card>
  <Card title="Theming" href="/docs/theming">Colors and fonts.</Card>
</Cards>
```

## Steps

Server-safe, numbered with a CSS counter.

```tsx title="components/mdx/steps.tsx"
import type { ReactNode } from "react"

export function Steps({ children }: { children?: ReactNode }) {
  return <div className="my-6 ml-3 border-l pl-6 [counter-reset:step]">{children}</div>
}

export function Step({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="relative pb-6 last:pb-0 [counter-increment:step]">
      <span className="bg-muted text-foreground absolute top-0 -left-[2.3rem] flex size-7 items-center justify-center rounded-full border text-xs font-medium before:content-[counter(step)]" />
      <p className="text-foreground mt-0.5 mb-2 font-semibold">{title}</p>
      <div className="[&>:first-child]:mt-0">{children}</div>
    </div>
  )
}
```

```mdx
<Steps>
  <Step title="Install">
    Run `pnpm add @ariadocs/mdx`.
  </Step>
  <Step title="Create the docs instance">
    Add `lib/docs.ts`.
  </Step>
</Steps>
```

## Tabs

A Client Component. `Tab` only carries its `title`, and `Tabs` reads it from its children.

```tsx title="components/mdx/tabs.tsx"
"use client"

import { Children, isValidElement, useState, type ReactElement, type ReactNode } from "react"
import { cn } from "@ariadocs/components"

type TabProps = { title: string; children?: ReactNode }

export function Tab({ children }: TabProps) {
  return <>{children}</>
}

export function Tabs({ children }: { children?: ReactNode }) {
  const tabs = Children.toArray(children).filter((child): child is ReactElement<TabProps> => isValidElement(child))
  const [active, setActive] = useState(0)

  return (
    <div className="my-6">
      <div role="tablist" className="not-prose flex gap-4 border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === active}
            onClick={() => setActive(index)}
            className={cn(
              "-mb-px border-b-2 py-2 text-sm transition-colors",
              index === active ? "border-foreground text-foreground" : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            {tab.props.title}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="[&>:first-child]:mt-4">
        {tabs[active]}
      </div>
    </div>
  )
}
```

````mdx
<Tabs>
  <Tab title="pnpm">
    ```bash
    pnpm add @ariadocs/mdx
    ```
  </Tab>
  <Tab title="npm">
    ```bash
    npm install @ariadocs/mdx
    ```
  </Tab>
</Tabs>
````

## Using OpenAPI parts in MDX

Add the namespace to the map (`components: { OpenAPI, ... }`), wrap the page in `OpenAPI.Root` (or render `<OpenAPI.Root api={api}>` around `{MDX}`), then write:

```mdx
<OpenAPI.Operation id="emails-send" />
```
