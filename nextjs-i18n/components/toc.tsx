import { getDocsTocs } from "@/lib/markdown";
import TocObserver from "./toc-observer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dictionary } from "@/lib/dictionaries";

export default async function Toc({
  path,
  dict,
}: {
  path: string;
  dict: Dictionary;
}) {
  const tocs = await getDocsTocs(path);

  return (
    <div className="lg:flex hidden toc flex-[1.5] min-w-[238px] py-9 sticky top-16 h-[96.95vh]">
      <div className="flex flex-col gap-3 w-full pl-2">
        <h3 className="font-semibold text-sm">{dict.docs.on_this_page}</h3>
        <ScrollArea className="pb-2 pt-0.5 overflow-y-auto">
          <TocObserver data={tocs} />
        </ScrollArea>
      </div>
    </div>
  );
}
