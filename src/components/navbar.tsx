import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export function Navbar() {
  return (
    <nav className="h-14 border-b-2 border-zinc-800 flex flex-row items-center sticky top-0 bg-inherit z-50">
      <div className="flex flex-row items-center justify-between w-[66%] max-[1250px]:w-[90%]  mx-auto">
        <div className="flex flex-row items-center gap-8">
          <Link href="/" className="text-lg font-bold whitespace-nowrap">
            NEXT.JS 13
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
          <Input placeholder="Search documentation..." />
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
