import { ModeToggle } from "@/components/theme-toggle";
import {
  GithubIcon,
  TwitterIcon,
  HexagonIcon,
  MoveUpRightIcon,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import Search from "./search";
import Anchor from "./anchor";
import { SheetLeftbar } from "./leftbar";
import { page_routes } from "@/lib/routes-config";
import { SheetClose } from "@/components/ui/sheet";

export const NAVLINKS = [
  {
    title: "Documentation",
    href: `/docs${page_routes[0].href}`,
  },
  {
    title: "Blog",
    href: "/blog",
  },
  {
    title: "Examples",
    href: "#",
  },
  {
    title: "Guides",
    href: "#",
  },
  {
    title: "Community",
    href: "https://github.com/nisabmohd/Aria-Docs/discussions",
    external: true,
  },
];

export function Navbar() {
  return (
    <nav className="w-full border-b h-16 sticky top-0 z-50 lg:px-4 px-2 backdrop-filter backdrop-blur-xl bg-opacity-5">
      <div className="sm:p-3 p-1 max-w-[1500px] mx-auto h-full flex items-center justify-between md:gap-2">
        <div className="flex items-center gap-5">
          <SheetLeftbar />
          <div className="flex items-center gap-6">
            <div className="sm:flex hidden">
              <Logo />
            </div>
            <div className="lg:flex hidden items-center gap-5 text-sm font-medium text-muted-foreground">
              <NavMenu />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Search />
            <div className="flex ml-2.5 sm:ml-0">
              <Link
                href="https://github.com/nisabmohd/NexDocs"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <GithubIcon className="h-[1.1rem] w-[1.1rem]" />
              </Link>
              <Link
                href="#"
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon",
                })}
              >
                <TwitterIcon className="h-[1.1rem] w-[1.1rem]" />
              </Link>
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <HexagonIcon className="w-7 h-7 text-muted-foreground fill-current" />
      <h2 className="text-md font-bold">AriaDocs</h2>
    </Link>
  );
}

export function NavMenu({ isSheet = false }) {
  return (
    <>
      {NAVLINKS.map((item) => {
        const Comp = (
          <Anchor
            key={item.title + item.href}
            activeClassName="text-primary font-semibold"
            absolute
            className="flex items-center gap-1"
            href={item.href}
          >
            {item.title}{" "}
            {item.external && (
              <MoveUpRightIcon
                className="w-3 h-3 align-super"
                strokeWidth={3}
              />
            )}
          </Anchor>
        );
        return isSheet ? (
          <SheetClose key={item.title + item.href} asChild>
            {Comp}
          </SheetClose>
        ) : (
          Comp
        );
      })}
    </>
  );
}
