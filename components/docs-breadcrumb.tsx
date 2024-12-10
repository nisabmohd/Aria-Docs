import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

export function DocsBreadcrumb({ paths }: { paths: string[] }) {
  return (
    <div className="pb-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Docs</BreadcrumbLink>
          </BreadcrumbItem>
          {paths.map((path, index) => (
            <Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index < paths.length - 1 ? (
                  <BreadcrumbLink className="a">
                    {toTitleCase(path)}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="b">
                    {toTitleCase(path)}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
export function ExamplesBreadcrumb({ paths }: { paths: string[] }) {
  return (
    <div className="pb-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Examples</BreadcrumbLink>
          </BreadcrumbItem>
          {paths.map((path, index) => (
            <Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index < paths.length - 1 ? (
                  <BreadcrumbLink className="a">
                    {toTitleCase(path)}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="b">
                    {toTitleCase(path)}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

function toTitleCase(input: string): string {
  const words = input.split("-");
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return capitalizedWords.join(" ");
}
