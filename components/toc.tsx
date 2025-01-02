import { getDocsTocs } from "@/lib/markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import clsx from "clsx";

export default async function Toc({ path }: { path: string }) {
  const tocs = await getDocsTocs(path);

  return (
    <div className="lg:flex hidden toc flex-[1] min-w-[230px] py-8 sticky top-16 h-[95.95vh]">
      <div className="flex flex-col gap-3 w-full pl-2">
        <h3 className="font-medium text-sm">On this page</h3>
        <ScrollArea className="pb-4 pt-0.5">
          <div className="flex flex-col gap-2.5 text-sm dark:text-neutral-300/85 text-neutral-800 ml-0.5">
            {tocs.map(({ href, level, text }) => (
              <Link
                key={href}
                href={href}
                className={clsx({
                  "pl-0": level == 2,
                  "pl-4": level == 3,
                  "pl-8 ": level == 4,
                })}
              >
                {text}
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
