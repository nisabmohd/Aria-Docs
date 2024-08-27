import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { EachRoute, ROUTES } from "./routes-config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function helperSearch(
  query: string,
  node: EachRoute,
  prefix: string = ""
) {
  const res: EachRoute[] = [];
  let parentHas = false;

  const nextLink = `${prefix}${node.href}`;
  if (!node.noLink && node.title.toLowerCase().includes(query.toLowerCase())) {
    res.push({ ...node, items: undefined, href: nextLink });
    parentHas = true;
  }
  node.items?.forEach((item) => {
    const innerRes = helperSearch(query, item, nextLink);
    if (!!innerRes.length && !parentHas && !node.noLink) {
      res.push({ ...node, items: undefined, href: nextLink });
      parentHas = true;
    }
    res.push(...innerRes);
  });
  return res;
}

export function advanceSearch(query: string) {
  return ROUTES.map((node) => helperSearch(query, node)).flat();
}
