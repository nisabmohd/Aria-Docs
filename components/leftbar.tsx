import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { AlignLeftIcon } from "lucide-react";
import DocsMenu from "./docs-menu";

export function Leftbar() {
  return (
    <aside className="md:flex hidden flex-[1] min-w-[230px] sticky top-16 flex-col h-[94.5vh] overflow-y-auto">
      <ScrollArea className="py-4">
        <DocsMenu />
      </ScrollArea>
    </aside>
  );
}

export function SheetLeftbar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden flex">
          <AlignLeftIcon className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-4 px-0" side="left">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetHeader>
          <h2 className="font-extrabold text-start px-8">Menu</h2>
        </SheetHeader>
        <ScrollArea className="flex flex-col gap-4">
          <div className="mx-2 px-5">
            <DocsMenu isSheet />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
