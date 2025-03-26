import { cn } from "@/lib/utils";
import clsx from "clsx";
import { Children, PropsWithChildren } from "react";

export function Stepper({ children }: PropsWithChildren) {
  const length = Children.count(children);

  return (
    <div className="flex flex-col">
      {Children.map(children, (child, index) => {
        return (
          <div
            className={cn(
              "border-l pl-12 ml-3 relative pb-1 pr-2 py-3",
              clsx({
                "pb-5 ": index < length - 1,
              })
            )}
          >
            <div className="bg-muted w-8 h-8 text-xs font-medium rounded-md border flex items-center justify-center absolute -left-4 font-code">
              {index + 1}
            </div>
            <div className="prose-headings:mt-0 prose-p:mb-3 prose-p:mt-3 last:prose-p:mb-0">
              {child}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StepperItem({
  children,
  title,
}: PropsWithChildren & { title?: string }) {
  return (
    <div className="pt-0.5">
      <h5 className="mt-0 font-semibold">{title}</h5>
      <div>{children}</div>
    </div>
  );
}
