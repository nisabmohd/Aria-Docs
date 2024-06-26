import { getTocs } from "@/lib/markdown";
import TocObserver from "./toc-observer";
export default async function Toc({ path }: { path: string }) {
  const tocs = await getTocs(path);

  return (
    <div className="lg:flex hidden toc flex-[1] min-w-[230px] py-8 sticky top-16">
      <div className="flex flex-col gap-2.5">
        <h3 className="font-medium text-sm">On this page</h3>
        <TocObserver data={tocs} />
      </div>
    </div>
  );
}
