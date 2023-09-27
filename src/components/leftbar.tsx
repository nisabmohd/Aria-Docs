import { docs } from "@/config/docs";
import Anchor from "./anchor";

export default function Leftbar() {
  return (
    <div>
      {docs.map((item) => {
        return (
          <div key={item.id}>
            <p className="mb-3 font-semibold dark:text-zinc-100 text-zinc-700 text-sm">
              {item.title}
            </p>
            <div className="flex flex-col gap-2 mb-5">
              {item.items.map((path) => (
                <Anchor
                  href={path.href}
                  className="text-muted text-sm dark:text-zinc-400"
                  key={path.title + path.href}
                >
                  {path.title}
                </Anchor>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
