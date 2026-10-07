import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { compile } from "@mdx-js/mdx"
import {
  createDocs,
  getFrontmatter,
  getNavigation,
  getPagePaths,
  getToc,
  isMdxNotFound,
  MdxError,
  readMdx,
  serializeMdx,
} from "../src/index.js"
import { rehypeCodeTitles, rehypePrism, remarkBlockJs } from "../src/plugins.js"

const contentDir = fileURLToPath(new URL("./fixtures/content", import.meta.url))

describe("file sources", () => {
  it("reads frontmatter and toc from files and strings alike", async () => {
    expect(await getFrontmatter({ contentDir, slug: "intro" })).toEqual({ title: "Intro" })
    // The page title (h1) is skipped, like remark-flexible-toc's default.
    expect(await getToc({ contentDir, slug: "intro" })).toEqual([
      { value: "Install", href: "#install", depth: 2 },
    ])
    expect(await getFrontmatter({ source: "---\ntitle: Inline\n---\nBody" })).toEqual({ title: "Inline" })
  })

  it("rejects slugs that escape the content directory", async () => {
    for (const slug of ["../secret", "guides/../../secret", "..\\secret", "intro\0", "a//b"]) {
      const error = await readMdx({ contentDir, slug }).catch((e: unknown) => e)
      expect(error, slug).toBeInstanceOf(MdxError)
      expect((error as MdxError).code, slug).toBe("MDX_INVALID_SLUG")
      expect(isMdxNotFound(error)).toBe(true)
    }

    // Absolute-looking slugs stay inside the content directory.
    const absolute = await readMdx({ contentDir, slug: "/etc/passwd" }).catch((e: unknown) => e)
    expect((absolute as MdxError).code).toBe("MDX_NOT_FOUND")
  })

  it("resolves folder index pages", async () => {
    expect(await getFrontmatter({ contentDir, slug: "guides" })).toEqual({ title: "Guides" })
    expect(await getFrontmatter({ contentDir, slug: "guides/index" })).toEqual({ title: "Guides" })
    const root = await readMdx({ contentDir, slug: "" }).catch((e: unknown) => e)
    expect((root as MdxError).code).toBe("MDX_NOT_FOUND")
  })

  it("throws MDX_NOT_FOUND for missing pages", async () => {
    const error = await readMdx({ contentDir, slug: "nope" }).catch((e: unknown) => e)
    expect((error as MdxError).code).toBe("MDX_NOT_FOUND")
  })
})

describe("untrusted content", () => {
  it("never evaluates JavaScript frontmatter", async () => {
    const source = "---js\n{ title: (globalThis.__pwned = true, 'x') }\n---\nBody"
    await expect(getFrontmatter({ source })).rejects.toThrow(/JavaScript frontmatter/)
    expect((globalThis as Record<string, unknown>).__pwned).toBeUndefined()
  })

  it("blockJs strips expressions, ESM and expression attributes", async () => {
    const source = [
      'import fs from "node:fs"',
      'export const leak = 1',
      "",
      "Hello {process.env.SECRET}",
      "",
      '<Box title="ok" onClick={() => alert(1)} {...props}>Hi</Box>',
    ].join("\n")

    const compiled = String(await compile(source, { remarkPlugins: [remarkBlockJs] }))
    expect(compiled).not.toContain("process.env")
    expect(compiled).not.toContain("node:fs")
    expect(compiled).not.toContain("alert")
    expect(compiled).not.toContain("leak")
    expect(compiled).toContain('"ok"')
  })

  it("serializes with imports disabled", async () => {
    const result = await serializeMdx({ source: 'import x from "some-module"\n\n# Hi' })
    expect("compiledSource" in result.serialized).toBe(true)
    if ("compiledSource" in result.serialized) {
      expect(result.serialized.compiledSource).not.toContain("some-module")
    }

    const ok = await serializeMdx({ source: "---\ntitle: T\n---\n# Hi", blockJs: true })
    expect("compiledSource" in ok.serialized).toBe(true)
    expect(ok.frontmatter).toEqual({ title: "T" })
  })
})

describe("navigation", () => {
  it("orders by _meta.json, skips dead entries and private files", async () => {
    const nav = await getNavigation({ contentDir })
    expect(nav.map((item) => [item.href, item.title, item.nav])).toEqual([
      ["/intro", "Introduction", true],
      ["/guides", "Guides", true],
      ["/hidden", "Hidden", false],
    ])
    expect(nav[1]?.items.map((item) => item.href)).toEqual(["/guides", "/guides/setup"])
  })

  it("lists page paths without private folders", async () => {
    expect((await getPagePaths({ contentDir })).sort()).toEqual(["/guides", "/guides/setup", "/hidden", "/intro"])
  })

  it("createDocs shares config and allows per-call overrides", async () => {
    const docs = createDocs({ contentDir })
    expect(docs.config.contentDir).toBe(contentDir)
    expect(await docs.getFrontmatter({ slug: "guides/setup" })).toEqual({ title: "Setup" })
    expect((await docs.getToc({ slug: "guides/setup" }))[0]?.value).toBe("Step one")
    expect(await docs.getPagePaths()).toHaveLength(4)
    const { frontmatter, toc } = await docs.parse({ slug: "intro" })
    expect(frontmatter).toEqual({ title: "Intro" })
    expect(toc).toHaveLength(1)
  })
})

describe("plugins", () => {
  const compiledWith = async (source: string) => {
    const { serialized } = await serializeMdx({ source, rehypePlugins: [rehypeCodeTitles, rehypePrism] })
    if (!("compiledSource" in serialized)) throw serialized.error
    return serialized.compiledSource
  }

  it("rehypeCodeTitles reads title=\"...\" and the lang:title shorthand", async () => {
    for (const fence of ['```ts title="lib/docs.ts"', "```ts title='lib/docs.ts'", "```ts:lib/docs.ts"]) {
      const compiled = await compiledWith(`${fence}\nconst a = 1\n\`\`\``)
      expect(compiled, fence).toContain('"rehype-code-title"')
      expect(compiled, fence).toContain('"lib/docs.ts"')
      expect(compiled, fence).toContain("language-ts")
      expect(compiled, fence).not.toContain("language-ts:")
      expect(compiled, fence).toContain("token")
    }
  })

  it("rehypeCodeTitles leaves untitled code blocks alone", async () => {
    const compiled = await compiledWith("```ts\nconst a = 1\n```\n\n```\nplain\n```")
    expect(compiled).not.toContain("rehype-code-title")
  })
})

describe("serializeMdx output", () => {
  it("is plain JSON", async () => {
    const result = await serializeMdx({ source: "---\ntitle: Hi\n---\n# Hi" })
    expect(result.serialized.frontmatter).toEqual({})
    expect(result.serialized.scope).toEqual({})
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("throws MDX_COMPILE_ERROR instead of returning the error", async () => {
    const error = await serializeMdx({ source: "<div>unclosed" }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(MdxError)
    expect((error as MdxError).code).toBe("MDX_COMPILE_ERROR")
    expect(isMdxNotFound(error)).toBe(false)
  })
})
