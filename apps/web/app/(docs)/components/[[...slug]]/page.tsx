import { createMdxRoute } from "@/lib/mdx-route"
import { getComponentsNavigation } from "@/lib/navigation"
import { componentDocs } from "@/lib/source"

const route = createMdxRoute(componentDocs, "/components", getComponentsNavigation)

export default route.Page
export const generateMetadata = route.generateMetadata
export const generateStaticParams = route.generateStaticParams
export const dynamicParams = false
