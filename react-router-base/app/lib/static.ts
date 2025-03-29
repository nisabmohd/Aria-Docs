import path from "path";
import { promises as fs } from "fs";
import { page_routes } from "./routes-config";

export async function getAllBlogStaticPaths() {
  try {
    const blogFolder = path.join(process.cwd(), "/app/contents/blogs/");
    const res = await fs.readdir(blogFolder);
    return res.map((file) => `/blog/${file.split(".")[0]}`);
  } catch (err) {
    return [];
  }
}

export function generateDocsStaticParams() {
  return page_routes.map((item) => `/docs${item.href}`);
}
