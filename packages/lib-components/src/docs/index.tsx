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
import { DocsNav } from "./nav.js"
import { DocsToc } from "./toc.js"

/**
 * The `Docs` component namespace: layout and navigation for MDX pages.
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
 */
export const Docs = {
  Layout: DocsLayout,
  Sidebar: DocsSidebar,
  Content: DocsContent,
  Aside: DocsAside,
  Nav: DocsNav,
  Toc: DocsToc,
  Page: compound(
    DocsPage,
    { Title: DocsPageTitle, Description: DocsPageDescription, Content: DocsPageContent },
    "Docs.Page"
  ),
}
