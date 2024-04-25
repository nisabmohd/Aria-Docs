import { buttonVariants } from "@/components/ui/button";
import { FLATTEND_ROUTES } from "@/lib/routes-config";
import { TerminalIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[90vh] flex-col items-center justify-center text-center px-2 py-8">
      <p className="mb-5 sm:text-xl">Follow along on Twitter</p>
      <h1 className="text-3xl font-bold mb-4 sm:text-7xl">
        An example app built using Next.js and server components.
      </h1>
      <p className="mb-8 sm:text-xl max-w-[800px] text-muted-foreground">
        Used by some of the worlds largest companies, This unknown lib enables
        you to create high-quality web applications with the power of web
        components.
      </p>
      <div className="flex flex-row items-center gap-5">
        <Link
          href={`/docs/${FLATTEND_ROUTES[0].href}`}
          className={buttonVariants({ className: "px-6" })}
        >
          Get Stared
        </Link>
        <Link
          href="#"
          className={buttonVariants({
            variant: "outline",
            className: "px-6",
          })}
        >
          Customize
        </Link>
      </div>
      <span className="flex flex-row items-center gap-2 text-zinc-400 text-md mt-7 -mb-12 max-[800px]:mb-12">
        <TerminalIcon className="w-4 h-4" /> ~ npx this-library-name@latest
      </span>
    </div>
  );
}
