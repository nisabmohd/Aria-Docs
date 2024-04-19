import { ROUTES } from "@/lib/routes-config";
import Anchor from "./anchor";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Leftbar() {
  return (
    <aside className="md:flex hidden flex-[0.9] min-w-[230px] sticky top-16 flex-col h-[92.75vh] overflow-y-auto">
      <ScrollArea className="py-4">
        {ROUTES.map(({ href, items, title }) => {
          return (
            <div className="flex flex-col gap-3 mt-5" key={href}>
              <h4 className="font-medium text-sm">{title}</h4>
              <div className="flex flex-col gap-3 text-sm dark:text-neutral-300/85 text-neutral-800 ml-0.5">
                {items.map((subItem) => {
                  const key = `/docs/${href}${subItem.href}`;
                  return (
                    <Anchor
                      activeClassName="font-medium dark:text-white text-black"
                      href={key}
                      key={key}
                      disabled={subItem.disabled}
                    >
                      {subItem.title}
                    </Anchor>
                  );
                })}
              </div>
            </div>
          );
        })}
      </ScrollArea>
    </aside>
  );
}
