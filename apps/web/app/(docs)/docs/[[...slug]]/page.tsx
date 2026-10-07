import { createMdxRoute } from "@/lib/mdx-route"
import { getDocsNavigation } from "@/lib/navigation"
import { docs } from "@/lib/source"

const route = createMdxRoute(docs, "/docs", getDocsNavigation)

export default route.Page
export const generateMetadata = route.generateMetadata
export const generateStaticParams = route.generateStaticParams
export const dynamicParams = false
