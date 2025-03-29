import { Outlet } from "react-router";

export default function BlogLayout() {
  return (
    <div className="flex flex-col items-start justify-center pt-8 pb-10 w-full mx-auto">
      <Outlet />
    </div>
  );
}
