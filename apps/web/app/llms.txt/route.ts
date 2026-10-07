import { getLlmsTxt } from "@/lib/llms"

// Built once at build time: the docs index, one link per page.
export const dynamic = "force-static"

export async function GET() {
  return new Response(await getLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
