import { buttonVariants } from "~/components/ui/button";
import { MoveUpRightIcon, TerminalSquareIcon } from "lucide-react";

import type { Route } from "./+types/home";
import { Link } from "react-router";
import { page_routes } from "~/lib/routes-config";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="flex sm:min-h-[87.5vh] min-h-[82vh] flex-col sm:items-center justify-center text-center px-2 sm:py-8 py-12">
      <Link
        to="https://github.com/nisabmohd/Aria-Docs"
        target="_blank"
        className="mb-5 sm:text-lg flex items-center gap-2 underline underline-offset-4 sm:-mt-12"
      >
        Follow along on GitHub{" "}
        <MoveUpRightIcon className="w-4 h-4 font-extrabold" />
      </Link>
      <h1 className="text-[2.4rem] sm:px-8 leading-10 sm:leading-[4.5rem] font-bold mb-4 sm:text-6xl text-left sm:text-center">
        Effortlessly build stunning documentation sites with flexibility for
        diverse projects.
      </h1>
      <p className="mb-8 sm:text-lg max-w-[1200px] text-muted-foreground text-left sm:text-center">
        This feature-packed documentation template, built with multiple
        frameworks including Next.js, React Router, and TanStack Router, offers
        a sleek and responsive design, perfect for all your project
        documentation needs.
      </p>
      <div className="sm:flex sm:flex-row grid grid-cols-2 items-center sm;gap-5 gap-3 mb-8">
        <Link
          to={`/docs${page_routes[0].href}`}
          className={buttonVariants({ className: "px-6", size: "lg" })}
        >
          Get Stared
        </Link>
        <Link
          to="/blog"
          className={buttonVariants({
            variant: "secondary",
            className: "px-6",
            size: "lg",
          })}
        >
          Read Blog
        </Link>
      </div>
      <span className="sm:flex hidden flex-row items-start sm:gap-2 gap-0.5 text-muted-foreground text-md mt-9 -mb-12 max-[800px]:mb-12 font-code sm:text-base text-sm font-medium border rounded-full p-2.5 px-5 bg-muted/55">
        <TerminalSquareIcon className="w-5 h-5 sm:mr-1 mt-0.5" />
        {"npx create-aria-doc <project-directory>"}
      </span>
    </div>
  );
}
