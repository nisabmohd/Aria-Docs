import { HTMLProps } from "react";

export default function anchor({
  className = "",
  children,
  ...props
}: HTMLProps<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      className={`${className} text-[#3b82f6] font-semibold text-sm`}
    >
      {children}
    </a>
  );
}
