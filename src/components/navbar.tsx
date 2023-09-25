import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export function Navbar() {
  return (
    <nav className="h-14 border-b-2 border-zinc-800 flex flex-row items-center justify-between sticky top-0 bg-inherit px-96">
      <div className="flex flex-row items-center gap-8">
        <Link href="/" className="text-lg font-bold ">
          NEXT.JS 13
        </Link>
        <div className="flex flex-row items-center gap-4">
          <Link className="text-muted text-sm" href="#">
            Pricing
          </Link>
          <Link className="text-muted text-sm" href="/docs/getting-started">
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
    </nav>
  );
}
