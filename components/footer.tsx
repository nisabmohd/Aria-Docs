import Link from "next/link";
import { buttonVariants } from "./ui/button";

export default function Footer() {
  return (
    <footer className="border-t-2 w-full h-16">
      <div className="container flex items-center justify-center h-full text-muted-foreground text-sm">
        Build by{" "}
        <Link
          className={buttonVariants({
            variant: "link",
            className: "mx-0 px-1 underline",
          })}
          href="https://github.com/nisabmohd"
        >
          nisabmohd
        </Link>
        . The source code is available in{" "}
        <Link
          className={buttonVariants({
            variant: "link",
            className: "mx-0 px-1 underline",
          })}
          href="https://github.com/nisabmohd/Docs-Stater-Template"
        >
          GitHub
        </Link>
        .
      </div>
    </footer>
  );
}
