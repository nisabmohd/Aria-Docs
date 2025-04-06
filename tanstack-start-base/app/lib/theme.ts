import { Theme } from "@/components/theme-provider";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";

const storageKey = "ui-theme";

export const getThemeSeverFn = createServerFn().handler(async () => {
  return (getCookie(storageKey) || "light") as Theme;
});

export const setThemeSeverFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data != "string" && (data != "dark" || data != "light"))
      throw new Error("Invalid theme provided");
    return data as Theme;
  })
  .handler(async ({ data }) => {
    setCookie(storageKey, data);
  });
