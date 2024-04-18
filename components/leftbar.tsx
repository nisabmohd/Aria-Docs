import { ROUTES } from "@/lib/routes-config";
import Link from "next/link";
import Anchor from "./anchor";

export default function Leftbar() {
  return (
    <aside className="flex-[1] py-8 sticky top-16 flex flex-col gap-5 h-[92.75vh] overflow-y-auto">
      {ROUTES.map(({ href, items, title }) => {
        return (
          <div className="flex flex-col gap-2.5" key={href}>
            <h4 className="font-medium text-sm">{title}</h4>
            <div className="flex flex-col gap-2.5 text-sm dark:text-neutral-300 text-neutral-800 ml-0.5">
              {items.map((subItem) => {
                const key = `/docs/${href}${subItem.href}`;
                return (
                  <Anchor
                    activeClassName="font-medium dark:text-white text-black"
                    href={key}
                    key={key}
                  >
                    {subItem.title}
                  </Anchor>
                );
              })}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
