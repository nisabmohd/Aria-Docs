import { EachRoute, ROUTES } from "@/lib/routes-config";
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
import { AlignLeftIcon, ChevronsUpDownIcon } from "lucide-react";
import { FooterButtons } from "./footer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { DialogTitle } from "./ui/dialog";

export function Leftbar() {
  return (
    <aside className="md:flex hidden flex-[1] min-w-[230px] sticky top-16 flex-col h-[92.75vh] overflow-y-auto">
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
        <DialogTitle className="sr-only">Menu</DialogTitle>
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
    <div className="flex flex-col gap-3.5 mt-5">
      {ROUTES.map((item, index) => {
        const modifiedItems = {
          ...item,
          href: `/docs${item.href}`,
          level: 0,
          isSheet,
        };
        return <SubLink key={item.title + index} {...modifiedItems} />;
      })}
    </div>
  );
}

function SubLink({
  title,
  href,
  items,
  noLink,
  level,
  isSheet,
}: EachRoute & { level: number; isSheet: boolean }) {
  const Comp = (
    <Anchor activeClassName="text-primary font-medium" href={href}>
      {title}
    </Anchor>
  );

  const titleOrLink = !noLink ? (
    isSheet ? (
      <SheetClose asChild>{Comp}</SheetClose>
    ) : (
      Comp
    )
  ) : (
    <h4 className="font-medium sm:text-sm text-primary">{title}</h4>
  );

  if (!items) {
    return <div className="flex flex-col">{titleOrLink}</div>;
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <Collapsible defaultOpen={level == 0}>
        <div className="flex items-center gap-2">
          {titleOrLink}
          <CollapsibleTrigger asChild>
            <Button
              className="ml-auto mr-3.5 h-6 w-6"
              variant="link"
              size="icon"
            >
              <ChevronsUpDownIcon className="h-3 w-3" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div
            className={cn(
              "flex flex-col items-start sm:text-sm dark:text-neutral-300/85 text-neutral-800 ml-0.5 mt-2.5 gap-3",
              level > 0 && "pl-4 border-l ml-1"
            )}
          >
            {items?.map((innerLink, index) => {
              const modifiedItems = {
                ...innerLink,
                href: `${href + innerLink.href}`,
                level: level + 1,
                isSheet,
              };
              return (
                <SubLink key={innerLink.title + index} {...modifiedItems} />
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
