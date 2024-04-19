import { ModeToggle } from "@/components/theme-toggle";
import { AppWindowMacIcon, GithubIcon, TwitterIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import Search from "./search";
import Anchor from "./anchor";

export default function Navbar() {
  return (
    <nav className="border-b-2 w-full h-14 sticky top-0 bg-inherit z-50">
      <div className="p-2 max-w-[1480px] mx-auto h-full flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="sm:flex hidden items-center gap-2">
            <AppWindowMacIcon className="w-7 h-7 text-muted-foreground" />
            <h2 className="text-md font-bold">template/docs</h2>
          </Link>
          <div className="md:flex hidden items-center gap-5 text-sm font-medium text-muted-foreground">
            <Anchor
              activeClassName="text-black dark:text-white font-semibold"
              absolute
              href="/docs/getting-started/introduction"
            >
              Docs
            </Anchor>
            <Link href="#">Examples</Link>
            <Link href="#">Guides</Link>
            <Link href="#">Examples</Link>
            <Link href="#">Blog</Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Search />
            <div className="-space-x-2">
              <Link
                href="#"
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
