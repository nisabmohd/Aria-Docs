import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  layout("./routes/blog-layout.tsx", [
    route("blog", "./routes/blog-index.tsx"),
    route("blog/:slug", "./routes/blog-slug.tsx"),
  ]),
  layout("./routes/docs-layout.tsx", [route("docs/*", "./routes/docs.tsx")]),
] satisfies RouteConfig;
