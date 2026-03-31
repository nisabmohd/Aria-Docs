import { docs } from "@/ariadocs";
import { Sidebar } from "@/components/sidebar";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = await docs.getNavItems();

  return (
    <div className="mx-auto">
      <Sidebar items={navItems} />
      <div className="mx-auto max-w-3xl">{children}</div>
    </div>
  );
}
