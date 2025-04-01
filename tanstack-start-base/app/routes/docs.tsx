import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Leftbar } from "@/components/leftbar";

export const Route = createFileRoute("/docs")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex items-start gap-8">
      <Leftbar key="leftbar" />
      <div className="flex-[5.25]">
        <Outlet />
      </div>
    </div>
  );
}
