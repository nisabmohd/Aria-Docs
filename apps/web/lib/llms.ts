import type { NavItem } from "@ariadocs/core"
import type { DocsInstance } from "@ariadocs/mdx"
import { getOperationTitle, type APIOperation } from "@ariadocs/openapi"
import { flattenLinks, getSidebar } from "./navigation"
import { componentDocs, docs, openapi, REFERENCE_BASE } from "./source"
import { site } from "./site"

/* Plain-text versions of the site for LLMs: /llms.txt (index) and /llms-full.txt (everything). */

const sources: { base: string; source: DocsInstance }[] = [
  { base: "/docs", source: docs },
  { base: "/components", source: componentDocs },
]

interface Page {
  title: string
  href: string
  description?: string
  /** The MDX source without frontmatter. Only for MDX pages. */
  body?: string
  operation?: APIOperation
}

interface Section {
  title: string
  pages: Page[]
}

function resolve(href: string): { source: DocsInstance; slug: string } | undefined {
  for (const { base, source } of sources) {
    if (href === base) return { source, slug: "" }
    if (href.startsWith(`${base}/`)) return { source, slug: href.slice(base.length + 1) }
  }
  return undefined
}

async function toPage(item: NavItem, operations: Map<string, APIOperation>, withBody: boolean): Promise<Page> {
  const mdx = resolve(item.href)
  if (mdx !== undefined) {
    const frontmatter = await mdx.source.getFrontmatter<{ title?: string; description?: string }>({ slug: mdx.slug })
    const body = withBody ? stripFrontmatter(await mdx.source.read({ slug: mdx.slug })) : undefined
    return { title: frontmatter.title ?? item.title, href: item.href, description: frontmatter.description, body }
  }
  const operation = operations.get(item.href)
  if (operation !== undefined) {
    return {
      title: getOperationTitle(operation),
      href: item.href,
      description: `${operation.method.toUpperCase()} ${operation.path}`,
      operation,
    }
  }
  return { title: item.title, href: item.href }
}

/** Every page in sidebar order, grouped by sidebar section. */
async function getSections(withBody: boolean): Promise<Section[]> {
  const [sidebar, api] = await Promise.all([getSidebar(), openapi.parse()])
  const operations = new Map(api.operations.map((operation) => [`${REFERENCE_BASE}/${operation.id}`, operation]))
  return Promise.all(
    sidebar.map(async (section) => ({
      title: section.title,
      pages: await Promise.all(flattenLinks(section.items).map((item) => toPage(item, operations, withBody))),
    }))
  )
}

function stripFrontmatter(source: string): string {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim()
}

function url(href: string): string {
  return `${site.url}${href}`
}

function header(): string {
  return `# ${site.name}\n\n> ${site.description}\n\nInstall: \`${site.install}\``
}

export async function getLlmsTxt(): Promise<string> {
  const sections = await getSections(false)
  const lines = [
    header(),
    `The full text of every page is at ${url("/llms-full.txt")}.`,
    "@ariadocs/components does not include MDX content components (Callout, Tabs, Steps, Cards). Write your own and pass them to `createDocs({ components })`.",
  ]
  for (const section of sections) {
    lines.push(`## ${section.title}`)
    lines.push(
      section.pages
        .map((page) => `- [${page.title}](${url(page.href)})${page.description ? `: ${page.description}` : ""}`)
        .join("\n")
    )
  }
  return `${lines.join("\n\n")}\n`
}

export async function getLlmsFullTxt(): Promise<string> {
  const sections = await getSections(true)
  const parts = [header()]
  for (const section of sections) {
    for (const page of section.pages) {
      const content = page.body ?? (page.operation !== undefined ? describeOperation(page.operation) : undefined)
      if (content === undefined) continue
      const lead = page.description !== undefined && page.operation === undefined ? `\n\n${page.description}` : ""
      parts.push(`---\n\n# ${page.title}\n\nSource: ${url(page.href)}${lead}\n\n${content}`)
    }
  }
  return `${parts.join("\n\n")}\n`
}

function describeOperation(operation: APIOperation): string {
  const lines = [`\`${operation.method.toUpperCase()} ${operation.path}\``]
  if (operation.description) lines.push(operation.description)
  if (operation.parameters.length > 0) {
    lines.push(
      "Parameters:\n\n" +
        operation.parameters
          .map(
            (parameter) =>
              `- \`${parameter.name}\` (${parameter.in}${parameter.required ? ", required" : ""})${parameter.description ? `: ${parameter.description}` : ""}`
          )
          .join("\n")
    )
  }
  if (operation.responses.length > 0) {
    lines.push(
      "Responses:\n\n" +
        operation.responses
          .map((response) => `- \`${response.status}\`${response.description ? `: ${response.description}` : ""}`)
          .join("\n")
    )
  }
  return lines.join("\n\n")
}
