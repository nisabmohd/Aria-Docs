import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { NavItem } from "@ariadocs/core"
import { isMdxNotFound, type DocsInstance } from "@ariadocs/mdx"
import { ClientMdx } from "@/components/mdx-client"
import { MdxPage } from "@/components/mdx-page"
import { getEditUrl, getNeighbours } from "./navigation"

interface Frontmatter {
  title?: string
  description?: string
  /** `client` renders the page with serializeMdx + MdxClient instead of RSC. */
  render?: "server" | "client"
}

export type MdxRouteProps = { params: Promise<{ slug?: string[] }> }

/** page / generateMetadata / generateStaticParams for a `[[...slug]]` MDX route at `base`. */
export function createMdxRoute(source: DocsInstance, base: string, getNavigation: () => Promise<NavItem[]>) {
  async function Page({ params }: MdxRouteProps) {
    const segments = (await params).slug ?? []
    const slug = segments.join("/")
    const href = segments.length === 0 ? base : `${base}/${slug}`

    try {
      const frontmatter = await source.getFrontmatter<Frontmatter>({ slug })
      const { previous, next } = getNeighbours(await getNavigation(), href)
      const shared = {
        title: frontmatter.title,
        description: frontmatter.description,
        editUrl: getEditUrl(source, slug),
        previous,
        next,
      }

      if (frontmatter.render === "client") {
        const { serialized, toc } = await source.serialize({ slug })
        return (
          <MdxPage {...shared} toc={toc}>
            <ClientMdx serialized={serialized} />
          </MdxPage>
        )
      }

      const { MDX, toc } = await source.parse({ slug })
      return (
        <MdxPage {...shared} toc={toc}>
          {MDX}
        </MdxPage>
      )
    } catch (error) {
      if (isMdxNotFound(error)) notFound()
      throw error
    }
  }

  async function generateMetadata({ params }: MdxRouteProps): Promise<Metadata> {
    try {
      const frontmatter = await source.getFrontmatter<Frontmatter>({ slug: ((await params).slug ?? []).join("/") })
      return { title: frontmatter.title, description: frontmatter.description }
    } catch {
      return {}
    }
  }

  async function generateStaticParams() {
    const paths = await source.getPagePaths()
    return paths.map((path) => ({ slug: path.split("/").filter(Boolean) }))
  }

  return { Page, generateMetadata, generateStaticParams }
}
