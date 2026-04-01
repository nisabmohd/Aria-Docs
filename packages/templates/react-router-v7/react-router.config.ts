import type { Config } from "@react-router/dev/config";
import { docs } from "./app/ariadocs";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  async prerender({ getStaticPaths }) {
    let slugs = await docs.getPagePaths();
    return [
      ...getStaticPaths(), // "/" and "/blog"
      ...slugs.map((s) => `/docs${s}`),
    ];
  },
} satisfies Config;
