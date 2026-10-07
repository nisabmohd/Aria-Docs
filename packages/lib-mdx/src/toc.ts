import { remark } from "remark"
import remarkFlexibleToc, { type TocItem as FlexibleTocItem } from "remark-flexible-toc"
import type { TocItem } from "@ariadocs/core"

/** Extract headings as `{ value, href, depth }` (the shared `TocItem` shape). */
export async function extractToc(content: string): Promise<TocItem[]> {
  const items: FlexibleTocItem[] = []
  await remark().use(remarkFlexibleToc, { tocRef: items }).process(content)
  return items.map(({ value, href, depth }) => ({ value, href, depth }))
}
