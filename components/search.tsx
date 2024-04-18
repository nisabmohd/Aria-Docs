import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Search() {
  return (
    <div className="relative flex-1 max-w-md">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
      <Input
        className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 dark:focus:border-gray-700 dark:focus:ring-gray-700"
        placeholder="Search documentation..."
        type="search"
      />
    </div>
  );
}
