import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Command, FileText, Mail, Triangle } from "lucide-react";
import Search from "./search";
import Anchor from "./anchor";

//TODO: Highlight active nav itemw
export function Navbar() {
  return (
    <nav className="h-14 border-b-2 dark:border-zinc-800 border-zinc-200 flex flex-row items-center sticky top-0 bg-inherit z-50 pl-4 dark:bg-zinc-950 bg-white">
      <div className="flex flex-row items-center justify-between w-[70%] max-[1350px]:w-[94%]  mx-auto">
        <div className="flex flex-row items-center gap-8 ">
          <Link
            href="/"
            className="text-lg font-bold whitespace-nowrap flex flex-row gap-2"
          >
            <Command />
            <span>Docs/template</span>
          </Link>
          <div className="flex flex-row items-center gap-4 text-zinc-400">
            <Link className="text-muted text-sm" href="#">
              Pricing
            </Link>
            <Link className="text-muted text-sm" href="#">
              Blog
            </Link>
            <Anchor absolute className="text-sm" href="/docs/introduction">
              Documentation
            </Anchor>
            <Link className="text-muted text-sm" href="#">
              Templates
            </Link>
            <Link className="text-muted text-sm" href="#">
              Help
            </Link>
          </div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Search />
          <Button variant="secondary">
            <Triangle className="mr-2 h-4 w-4" />
            Deploy
          </Button>
        </div>
      </div>
    </nav>
  );
}
