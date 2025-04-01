import { ROUTES } from "@/lib/routes-config";
import SubLink from "./sublink";
import { useLocation } from "@tanstack/react-router";

export default function DocsMenu({ isSheet = false }) {
  const { pathname } = useLocation();
  if (!pathname.startsWith("/docs")) return null;

  return (
    <div className="flex flex-col gap-3.5 mt-5 pr-2 pb-6 sm:text-base text-[14.5px]">
      {ROUTES.map((item, index) => {
        const modifiedItems = {
          ...item,
          href: `/docs${item.href}`,
          level: 0,
          isSheet,
        };
        return <SubLink key={item.title + index} {...modifiedItems} />;
      })}
    </div>
  );
}
