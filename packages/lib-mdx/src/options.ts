import { remarkBlockJs } from "./plugins.js"
import type { MdxRenderOptions, RemarkPlugins } from "./types.js"

/** Remark plugins with `remarkBlockJs` prepended when `blockJs` is on. */
export function remarkPluginsFor(options: MdxRenderOptions): RemarkPlugins | undefined {
  if (options.blockJs !== true) return options.remarkPlugins
  return [remarkBlockJs, ...(options.remarkPlugins ?? [])]
}
