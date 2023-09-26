import { HTMLProps } from "react";

export default function Highlight({
  className = "",
  children,
  ...props
}: HTMLProps<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={`${className} dark:bg-zinc-800 bg-zinc-100 py-1 px-2 rounded-lg font-semibold text-sm`}
    >
      {children}
    </span>
  );
}
