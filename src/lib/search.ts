import { docs } from "@/config/docs";

export function getAllSlugsParams() {
  return docs
    .map((item) => item.items.map((param) => param.href))
    .flat()
    .filter((item) => item != "#");
}

export function search(query: string) {
  return docs
    .map((item) =>
      item.items.filter((inner) =>
        inner.title.toLowerCase().includes(query.toLowerCase())
      )
    )
    .flat();
}

export function getPreviousAndNext(url: string) {
  const flattedAll = docs.map((item) => item.items).flat();
  const index = flattedAll.findIndex((item) => item.href == "/docs/" + url);
  if (index == -1)
    return {
      previous: null,
      next: null,
    };
  return {
    previous: flattedAll[index - 1],
    next: flattedAll[index + 1],
  };
}
