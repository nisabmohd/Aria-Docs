// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import {
  generateDocsStaticParams,
  getAllBlogStaticPaths,
} from "./app/lib/static";

export default defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
  server: {
    hooks: {
      "prerender:routes": async (routes) => {
        const blogPaths = await getAllBlogStaticPaths();
        blogPaths.forEach((it) => routes.add(it));
        const docsPaths = generateDocsStaticParams();
        docsPaths.forEach((it) => routes.add(it));
      },
    },
    prerender: {
      routes: ["/"],
      crawlLinks: true,
    },
  },
});
