import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col items-start justify-center pt-8 pb-10 w-full mx-auto">
      <Outlet />
    </div>
  );
}
