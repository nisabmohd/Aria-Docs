import { getAllChilds } from "@/lib/markdown";
import Link from "next/link";

export default async function Outlet({ path }: { path: string }) {
  if (!path) throw new Error("path not provided");
  const output = await getAllChilds(path);
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {output.map((child) => (
        <ChildCard href="" {...child} key={child.title} />
      ))}
    </div>
  );
}

type ChildCardProps = { title: string; description: string; href: string };

function ChildCard({ description, href, title }: ChildCardProps) {
  return (
    <Link
      href={href}
      className="border rounded-md px-6 no-underline flex flex-col py-5 gap-0.5"
    >
      <h4 className="!my-0">{title}</h4>
      <p className="text-sm text-muted-foreground !my-0">{description}</p>
    </Link>
  );
}
