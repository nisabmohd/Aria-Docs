import { getToc, sluggify } from "@/lib/markdown";
import clsx from "clsx";
import Link from "next/link";

export default async function Toc({ path }: { path: string }) {
  const tocs = await getToc(path);

  return (
    <div className="lg:flex hidden toc flex-[1] min-w-[230px] py-8 sticky top-16">
      <div className="flex flex-col gap-2.5">
        <h3 className="font-medium text-sm">On this page</h3>
        <div className="flex flex-col gap-2.5 text-sm dark:text-neutral-300/85 text-neutral-800 ml-0.5">
          {tocs.map((toc) => {
            const slug = sluggify(toc.text);
            return (
              <Link
                key={slug}
                href={`#${slug}`}
                className={clsx({
                  "pl-0": toc.level == 2,
                  "pl-4": toc.level == 3,
                  "pl-8": toc.level == 4,
                })}
              >
                {toc.text}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
