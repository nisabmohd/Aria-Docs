import { docs } from "@/config/docs";

export function search(query: string) {
  return docs
    .map((item) =>
      item.items.filter((inner) =>
        inner.title.toLowerCase().includes(query.toLowerCase())
      )
    )
    .flat();
}
