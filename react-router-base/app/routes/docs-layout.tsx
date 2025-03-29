import { Outlet } from "react-router";
import { Leftbar } from "~/components/leftbar";

export default function DocsLayout() {
  return (
    <div className="flex items-start gap-8">
      <Leftbar key="leftbar" />
      <div className="flex-[5.25]">
        <Outlet />
      </div>
    </div>
  );
}
