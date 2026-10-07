"use client"

import type { SerializeResult } from "@ariadocs/mdx"
import { MdxClient } from "@ariadocs/mdx/client"
import { Pre } from "@ariadocs/components"
import { Callout, Card, Cards } from "./callout"
import { Install, Tab, Tabs } from "./install"

/** Client-side MDX rendering, used by pages with `render: client` frontmatter. */
export function ClientMdx({ serialized }: { serialized: SerializeResult }) {
  return <MdxClient serialized={serialized} components={{ pre: Pre, Callout, Cards, Card, Install, Tabs, Tab }} />
}
