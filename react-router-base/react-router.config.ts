import type { Config } from "@react-router/dev/config";
import {
  generateDocsStaticParams,
  getAllBlogStaticPaths,
} from "./app/lib/static";

export default {
  ssr: true,
  async prerender() {
    const blogPaths = await getAllBlogStaticPaths();
    const docsPaths = generateDocsStaticParams();
    return ["/", "/blog", ...blogPaths, ...docsPaths];
  },
} satisfies Config;
