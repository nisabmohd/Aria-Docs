import { HTMLProps } from "react";

export default function Tag({
  className = "",
  children,
  ...props
}: HTMLProps<HTMLSpanElement>) {
  return (
    <i
      {...props}
      className={`${className} dark:bg-zinc-800 bg-zinc-100 py-1 px-2  rounded-lg text-sm`}
    >
      {"<"}
      {children}
      {">"}
    </i>
  );
}
