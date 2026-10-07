"use client"

import { Children, isValidElement, useState, type ReactElement, type ReactNode } from "react"
import { CodeBlock, CodeTabs } from "@ariadocs/components"

const MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const
type Manager = (typeof MANAGERS)[number]

const COMMANDS: Record<Manager, (packages: string, dev: boolean) => string> = {
  pnpm: (p, dev) => `pnpm add${dev ? " -D" : ""} ${p}`,
  npm: (p, dev) => `npm install${dev ? " -D" : ""} ${p}`,
  yarn: (p, dev) => `yarn add${dev ? " -D" : ""} ${p}`,
  bun: (p, dev) => `bun add${dev ? " -d" : ""} ${p}`,
}

/** `<Install packages="@ariadocs/mdx" />` — the install command for each package manager. */
export function Install({ packages, dev = false }: { packages: string; dev?: boolean }) {
  const [manager, setManager] = useState<Manager>("pnpm")
  return (
    <CodeBlock
      className="not-prose my-6"
      language="bash"
      code={COMMANDS[manager](packages, dev)}
      actions={
        <CodeTabs
          label="Package manager"
          value={manager}
          options={MANAGERS.map((value) => ({ value, label: value }))}
          onChange={setManager}
        />
      }
    />
  )
}

/** One panel of `<Tabs>`. */
export function Tab({ children }: { value: string; children?: ReactNode }) {
  return <>{children}</>
}

/**
 * Tabs around code blocks in MDX:
 *
 * <Tabs items={["MDX", "OpenAPI"]}>
 *   <Tab value="MDX">```ts …```</Tab>
 *   <Tab value="OpenAPI">```ts …```</Tab>
 * </Tabs>
 */
export function Tabs({ items, children }: { items: string[]; children?: ReactNode }) {
  const [value, setValue] = useState(items[0] ?? "")
  const panels = Children.toArray(children).filter(
    (child): child is ReactElement<{ value: string; children?: ReactNode }> => isValidElement(child)
  )
  const current = panels.find((panel) => panel.props.value === value) ?? panels[0]

  return (
    <div className="not-prose bg-[var(--aria-code-background)] my-6 overflow-hidden rounded-xl border [&_[data-slot=pre]_pre]:m-0 [&_[data-slot=pre]_pre]:rounded-none [&_[data-slot=pre]_pre]:border-0 [&_pre]:overflow-x-auto [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:leading-relaxed [&_.rehype-code-title]:hidden">
      <div className="flex h-10 items-center border-b pl-1">
        <CodeTabs label="Code" value={value} options={items.map((item) => ({ value: item, label: item }))} onChange={setValue} />
      </div>
      <div role="tabpanel">{current?.props.children}</div>
    </div>
  )
}
