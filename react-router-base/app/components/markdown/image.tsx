import { type ComponentProps } from "react";

export default function Image({
  src,
  alt = "alt",
  width = 800,
  height = 350,
  ...props
}: ComponentProps<"img">) {
  if (!src) return null;
  return <img src={src} alt={alt} width={width} height={height} {...props} />;
}
