import { LeftExamplebar } from "@/components/leftbar";

export default function ExamplesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-start gap-8">
      <LeftExamplebar key="leftbar" />
      <div className="flex-[5.25]">{children}</div>
    </div>
  );
}
