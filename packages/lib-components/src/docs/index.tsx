// No "use client": assembles the namespace for Server and Client Components.

import { compound } from "../lib/compound.js"
import {
  DocsAside,
  DocsContent,
  DocsLayout,
  DocsPage,
  DocsPageContent,
  DocsPageDescription,
  DocsPageTitle,
  DocsSidebar,
} from "./layout.js"
import { DocsMobileNav } from "./mobile-nav.js"
import { DocsNav } from "./nav.js"
import { DocsToc } from "./toc.js"

/**
 * The `Docs` component namespace: layout and navigation for MDX pages.
 *
 * - `Docs.Layout`: the page grid. Columns follow the slots present.
 * - `Docs.Sidebar`: sticky left column (from `lg`).
 * - `Docs.MobileNav`: menu button and drawer for the nav below `lg`.
 * - `Docs.Content`: main column.
 * - `Docs.Aside`: sticky right column for the TOC (from `xl`).
 * - `Docs.Nav`: sidebar links from `getNavigation()`.
 * - `Docs.Toc`: "On this page" links from `toc`.
 * - `Docs.Page` with `.Title`, `.Description`, `.Content`: one MDX page.
 *
 * Not included: Callout, Tabs, Steps or Cards for MDX. Write your own and
 * pass them through the `components` option of `createDocs`.
 *
 * ```tsx
 * <Docs.Layout>
 *   <Docs.Sidebar><Docs.Nav items={nav} activeHref={pathname} /></Docs.Sidebar>
 *   <Docs.Content>
 *     <Docs.Page>
 *       <Docs.Page.Title>{frontmatter.title}</Docs.Page.Title>
 *       <Docs.Page.Description>{frontmatter.description}</Docs.Page.Description>
 *       <Docs.Page.Content>{MDX}</Docs.Page.Content>
 *     </Docs.Page>
 *   </Docs.Content>
 *   <Docs.Aside><Docs.Toc items={toc} /></Docs.Aside>
 * </Docs.Layout>
 * ```
 *
 * In Next.js App Router, `Docs.Layout` and `Docs.Sidebar` go in `layout.tsx`,
 * and `page.tsx` returns `<><Docs.Content /><Docs.Aside /></>` as a fragment
 * so both stay direct children of the grid.
 */
export const Docs = {
  Layout: DocsLayout,
  Sidebar: DocsSidebar,
  Content: DocsContent,
  Aside: DocsAside,
  MobileNav: DocsMobileNav,
  Nav: DocsNav,
  Toc: DocsToc,
  Page: compound(
    DocsPage,
    { Title: DocsPageTitle, Description: DocsPageDescription, Content: DocsPageContent },
    "Docs.Page"
  ),
}
