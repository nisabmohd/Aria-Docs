import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Mail } from "lucide-react";
import Search from "./search";

export function Navbar() {
  return (
    <nav className="h-14 border-b-2 border-zinc-800 flex flex-row items-center sticky top-0 bg-inherit z-50 pl-4">
      <div className="flex flex-row items-center justify-between w-[70%] max-[1350px]:w-[94%]  mx-auto">
        <div className="flex flex-row items-center gap-8 ">
          <Link
            href="/"
            className="text-lg font-bold whitespace-nowrap flex flex-row gap-2"
          >
            <FileText />
            <span>NEXT.JS 13</span>
          </Link>
          <div className="flex flex-row items-center gap-4">
            <Link className="text-muted text-sm" href="#">
              Pricing
            </Link>
            <Link className="text-muted text-sm" href="/docs/introduction">
              Documentation
            </Link>
            <Link className="text-muted text-sm" href="#">
              Blog
            </Link>
            <Link className="text-muted text-sm" href="#">
              Enterprise
            </Link>
          </div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Search />
          <Button variant="secondary">
            <Mail className="mr-2 h-4 w-4" />
            Mail
          </Button>
          <Button variant="default">Learn</Button>
        </div>
      </div>
    </nav>
  );
}
