import { buttonVariants } from "@/components/ui/button";
import { MoveUpRightIcon, TerminalIcon } from "lucide-react";
import Link from "next/link";
import GetStarted from "../components/get-started";

export default function Home() {
  return (
    <div className="flex sm:min-h-[91vh] min-h-[88vh] flex-col items-center justify-center text-center px-2 py-8">
      <Link
        href="https://github.com/nisabmohd/Aria-Docs"
        target="_blank"
        className="mb-5 sm:text-lg flex items-center gap-2 underline underline-offset-4"
      >
        Follow along on GitHub{" "}
        <MoveUpRightIcon className="w-4 h-4 font-extrabold" />
      </Link>
      <h1 className="text-3xl font-bold mb-4 sm:text-7xl">
        An example app built using Next.js and server components.
      </h1>
      <p className="mb-8 sm:text-xl max-w-[800px] text-muted-foreground">
        This feature-packed documentation template, built with Next.js, offers a
        sleek and responsive design, perfect for all your project documentation
        needs.
      </p>
      <div className="flex flex-row items-center gap-5">
        <GetStarted />
        <Link
          href="#"
          className={buttonVariants({
            variant: "outline",
            className: "px-6",
            size: "lg",
          })}
        >
          Customize
        </Link>
      </div>
      <span className="flex flex-row items-center gap-2 text-zinc-400 text-md mt-7 -mb-12 max-[800px]:mb-12">
        <TerminalIcon className="w-4 h-4 mr-1" /> ~ npx this-library-name@latest
      </span>
    </div>
  );
}
