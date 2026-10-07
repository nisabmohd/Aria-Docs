import type { ReactNode } from "react"
import { Docs } from "@ariadocs/components"
import type { TocItem } from "@ariadocs/core"
import type { PageLink } from "@/lib/navigation"
import { PageNav } from "./page-footer"

/** An MDX page: title row, content, previous/next, and the table of contents. */
export function MdxPage({
  title,
  description,
  toc,
  editUrl,
  previous,
  next,
  children,
}: {
  title?: string
  description?: string
  toc: TocItem[]
  editUrl?: string
  previous?: PageLink
  next?: PageLink
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-[76rem] justify-center gap-14 px-5 pt-10 pb-24 sm:px-10 lg:pt-14">
      <article className="w-full max-w-3xl min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          {title !== undefined ? <Docs.Page.Title>{title}</Docs.Page.Title> : null}
          {editUrl !== undefined ? (
            <a
              href={editUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground text-[13px] transition-colors"
            >
              Edit on GitHub
            </a>
          ) : null}
        </div>
        {description !== undefined ? <Docs.Page.Description>{description}</Docs.Page.Description> : null}
        <Docs.Page.Content>{children}</Docs.Page.Content>
        <PageNav previous={previous} next={next} />
      </article>
      <aside className="sticky top-14 hidden h-fit w-52 shrink-0 xl:block">
        <Docs.Toc items={toc} />
      </aside>
    </div>
  )
}
