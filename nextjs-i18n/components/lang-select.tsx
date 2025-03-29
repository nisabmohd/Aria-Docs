"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LanguagesIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const available_locales = [
  {
    title: "English",
    code: "en",
  },
  {
    title: "Français",
    code: "fr",
  },
  {
    title: "日本語",
    code: "ja",
  },
];

export default function LangSelect() {
  const pathname = usePathname();
  const router = useRouter();

  function handleChangeLocale(newLocale: string) {
    router.push(pathname.replace(/\/[a-z]{2}/, `/${newLocale}`));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <LanguagesIcon className="h-[1.1rem] w-[1.1rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {available_locales.map((locale) => (
          <DropdownMenuItem
            onClick={() => handleChangeLocale(locale.code)}
            key={locale.title}
          >
            {locale.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
