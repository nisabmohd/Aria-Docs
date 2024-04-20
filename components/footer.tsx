import Link from "next/link";
import { buttonVariants } from "./ui/button";

export default function Footer() {
  return (
    <footer className="border-t-[1px] border-gray-200 dark:border-gray-800 w-full h-16">
      <div className="container flex items-center justify-center h-full text-muted-foreground text-sm flex-wrap">
        <p className="text-center">
          Build by{" "}
          <Link
            className="px-1 underline underline-offset-2"
            href="https://github.com/nisabmohd"
          >
            nisabmohd
          </Link>
          . The source code is available on{" "}
          <Link
            className="px-1 underline underline-offset-2"
            href="https://github.com/nisabmohd/Docs-Stater-Template"
          >
            GitHub
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
