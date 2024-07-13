import { ROUTES } from "@/lib/routes-config";
import Anchor from "./anchor";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo, NavMenu } from "./navbar";
import { Button } from "./ui/button";
import { AlignLeftIcon } from "lucide-react";
import { FooterButtons } from "./footer";

export function Leftbar() {
  return (
    <aside className="md:flex hidden flex-[0.9] min-w-[230px] sticky top-16 flex-col h-[92.75vh] overflow-y-auto">
      <ScrollArea className="py-4">
        <Menu />
      </ScrollArea>
    </aside>
  );
}

export function SheetLeftbar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden flex">
          <AlignLeftIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-4 px-0" side="left">
        <SheetHeader>
          <SheetClose className="px-5" asChild>
            <Logo />
          </SheetClose>
        </SheetHeader>
        <ScrollArea className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 mt-3 mx-2 px-5">
            <NavMenu isSheet />
          </div>
          <div className="mx-2 px-5">
            <Menu isSheet />
          </div>
          <div className="p-6 pb-4 flex gap-2">
            <FooterButtons />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function Menu({ isSheet = false }) {
  return (
    <>
      {ROUTES.map(({ href, items, title }) => {
        return (
          <div className="flex flex-col gap-3 mt-5" key={href}>
            <h4 className="font-medium sm:text-sm">{title}</h4>
            <div className="flex flex-col gap-3 sm:text-sm dark:text-neutral-300/85 text-neutral-800 ml-0.5">
              {items.map((subItem) => {
                const key = `/docs/${href}${subItem.href}`;
                const Comp = (
                  <Anchor
                    activeClassName="font-medium text-primary"
                    key={key}
                    href={key}
                  >
                    {subItem.title}
                  </Anchor>
                );
                return isSheet ? (
                  <SheetClose key={key} asChild>
                    {Comp}
                  </SheetClose>
                ) : (
                  Comp
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
