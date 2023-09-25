import { docs } from "@/config/docs";
import Link from "next/link";

export default function Leftbar() {
  return (
    <div>
      {docs.map((item) => {
        return (
          <div key={item.id}>
            <p className="mb-3 font-semibold text-zinc-100 text-sm">
              {item.title}
            </p>
            <div className="flex flex-col gap-2 mb-5">
              {item.items.map((path) => (
                <Link
                  href={`/docs${path.href}`}
                  className="text-muted text-sm dark:text-zinc-400"
                  key={path.title + path.href}
                >
                  {path.title}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
