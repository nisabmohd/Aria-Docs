import fs from "node:fs"
import path from "node:path"
import type { NavItem } from "@ariadocs/core"
import type { DocsInstance } from "@ariadocs/mdx"
import { componentDocs, docs, openapi, REFERENCE_BASE } from "./source"
import { site } from "./site"

/** Prefix every relative href in a tree, e.g. "/intro" → "/docs/intro" ("/" → "/docs"). */
export function withBase(items: NavItem[], base: string): NavItem[] {
  return items.map((item) => ({
    ...item,
    href: item.href === "/" ? base : `${base}${item.href}`,
    items: withBase(item.items, base),
  }))
}

/** Every visible page link in order, folders flattened. */
export function flattenLinks(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => {
    if (!item.nav) return []
    if (item.items.length > 0) {
      // A folder with its own index page lists it first.
      const children = flattenLinks(item.items)
      return children
    }
    return [item]
  })
}

export interface PageLink {
  title: string
  href: string
}

/** Previous and next pages around `href`, in sidebar order. */
export function getNeighbours(items: NavItem[], href: string): { previous?: PageLink; next?: PageLink } {
  const links = flattenLinks(items)
  const index = links.findIndex((link) => link.href === href)
  if (index === -1) return {}
  const pick = (item?: NavItem) => (item === undefined ? undefined : { title: item.title, href: item.href })
  return { previous: pick(links[index - 1]), next: pick(links[index + 1]) }
}

/** GitHub URL of the MDX file behind a slug. */
export function getEditUrl(source: DocsInstance, slug: string): string | undefined {
  const dir = source.config.contentDir
  const normalized = slug === "" ? "index" : slug
  for (const file of [`${normalized}.mdx`, `${normalized}/index.mdx`]) {
    if (fs.existsSync(path.join(/* turbopackIgnore: true */ process.cwd(), dir, file))) {
      return `${site.editBase}/${dir}/${file}`
    }
  }
  return undefined
}

export async function getDocsNavigation(): Promise<NavItem[]> {
  return withBase(await docs.getNavigation(), "/docs")
}

export async function getComponentsNavigation(): Promise<NavItem[]> {
  return withBase(await componentDocs.getNavigation(), "/components")
}

export async function getReferenceNavigation(): Promise<NavItem[]> {
  const tags = await openapi.getNavigation({
    getOperationHref: (operation) => `${REFERENCE_BASE}/${operation.id}`,
    getTagHref: (tag) => `${REFERENCE_BASE}#${tag.id}`,
  })
  return [
    { title: "Overview", href: REFERENCE_BASE, nav: true, props: {}, items: [] },
    { title: "Schemas", href: `${REFERENCE_BASE}/schemas`, nav: true, props: {}, items: [] },
    ...tags,
  ]
}

function section(title: string, href: string, items: NavItem[]): NavItem {
  return { title, href, nav: true, props: {}, items }
}

/** The one sidebar shared by Docs, Components and the API Reference. */
export async function getSidebar(): Promise<NavItem[]> {
  const [docsNav, componentsNav, referenceNav] = await Promise.all([
    getDocsNavigation(),
    getComponentsNavigation(),
    getReferenceNavigation(),
  ])

  const isPackage = (item: NavItem) => item.title.startsWith("@ariadocs/")
  // The components docs live under /components; list them as a package folder.
  const packages = docsNav.filter(isPackage)
  const core = packages.findIndex((item) => item.title === "@ariadocs/core")
  packages.splice(core === -1 ? packages.length : core, 0, section("@ariadocs/components", "/components", componentsNav))

  return [
    section("Documentation", "#documentation", docsNav.filter((item) => !isPackage(item))),
    section("Packages", "#packages", packages),
    section("API Reference", "#api-reference", referenceNav),
  ]
}
