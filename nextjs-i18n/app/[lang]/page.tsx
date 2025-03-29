import LocalizedLink from "@/components/localized-link";
import { buttonVariants } from "@/components/ui/button";
import { getDictionary, LangProps } from "@/lib/dictionaries";
import { page_routes } from "@/lib/routes-config";
import { MoveUpRightIcon, TerminalSquareIcon } from "lucide-react";
import Link from "next/link";

export default async function Home({ params }: LangProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <div className="flex sm:min-h-[85.5vh] min-h-[85vh] flex-col items-center justify-center text-center px-2 sm:py-8 py-12">
      <Link
        href="https://github.com/nisabmohd/Aria-Docs"
        target="_blank"
        className="mb-5 sm:text-lg flex items-center gap-2 underline underline-offset-4 sm:-mt-12"
      >
        {dict.home.follow_github}
        <MoveUpRightIcon className="w-4 h-4 font-extrabold" />
      </Link>
      <h1 className="text-3xl font-bold mb-4 sm:text-6xl">
        {dict.home.main_header}
      </h1>
      <p className="mb-8 sm:text-lg max-w-[1200px] text-muted-foreground">
        {dict.home.sub_header}
      </p>
      <div className="flex flex-row items-center gap-5">
        <LocalizedLink
          href={`/docs${page_routes[0].href}`}
          className={buttonVariants({ className: "px-6", size: "lg" })}
        >
          {dict.home.get_started}
        </LocalizedLink>
        <LocalizedLink
          href="/blog"
          className={buttonVariants({
            variant: "secondary",
            className: "px-6",
            size: "lg",
          })}
        >
          {dict.home.read_blog}
        </LocalizedLink>
      </div>
      <span className="flex flex-row items-start sm:gap-2 gap-0.5 text-muted-foreground text-md mt-7 -mb-12 max-[800px]:mb-12 font-code sm:text-base text-sm font-medium">
        <TerminalSquareIcon className="w-5 h-5 sm:mr-1 mt-0.5" />
        {"npx create-aria-doc <project-directory>"}
      </span>
    </div>
  );
}
