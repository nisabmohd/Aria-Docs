import type { ComponentProps } from "react"
import Link from "next/link"
import { isExternalUrl } from "@ariadocs/core"

/** Internal links use Next.js routing; external links open in a new tab. */
export function MdxLink({ href = "", ...props }: ComponentProps<"a">) {
  if (isExternalUrl(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
  }
  return <Link href={href} {...props} />
}
