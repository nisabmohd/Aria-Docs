"use client";

import { usePathname, useRouter } from "next/navigation";

const available_locales = [
  { title: "English", code: "en" },
  { title: "日本語", code: "ja" },
];

export default function LangSelect() {
  const pathname = usePathname();
  const router = useRouter();

  function handleChangeLocale(newLocale: string) {
    router.push(pathname.replace(/\/[a-z]{2}/, `/${newLocale}`));
  }

  return (
    <div className="flex gap-3 mt-1">
      {available_locales.map((item) => (
        <button
          className="cursor-pointer"
          key={item.code}
          onClick={() => handleChangeLocale(item.code)}
        >
          {item.title}
        </button>
      ))}
    </div>
  );
}
