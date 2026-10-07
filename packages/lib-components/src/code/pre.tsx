"use client"

import { useRef, type ComponentProps } from "react"
import { cn } from "../lib/utils.js"
import { CopyButton } from "./code-block.js"

export interface PreProps extends ComponentProps<"pre"> {
  /** Raw code, set by `rehypeCodeRaw` from `@ariadocs/mdx/plugins`. */
  raw?: string
}

/**
 * Drop-in `pre` for MDX: keeps the highlighted children from rehype-prism
 * and adds a copy button.
 *
 * ```tsx
 * <MdxServer source={content} components={{ pre: Pre }} />
 * ```
 */
export function Pre({ raw, className, children, ...props }: PreProps) {
  const ref = useRef<HTMLPreElement>(null)

  return (
    <div data-slot="pre" className="group/pre relative">
      <pre ref={ref} className={cn("overflow-x-auto font-mono", className)} {...props}>
        {children}
      </pre>
      <CopyButton
        value={() => raw ?? ref.current?.innerText ?? ""}
        className="bg-background/80 absolute top-2 right-2 border opacity-0 backdrop-blur transition-opacity group-hover/pre:opacity-100 focus-visible:opacity-100"
      />
    </div>
  )
}
