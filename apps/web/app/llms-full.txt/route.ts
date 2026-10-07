import { getLlmsFullTxt } from "@/lib/llms"

// Built once at build time: every page as plain Markdown.
export const dynamic = "force-static"

export async function GET() {
  return new Response(await getLlmsFullTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
