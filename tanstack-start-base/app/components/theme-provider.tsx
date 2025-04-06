import { useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { createContext, PropsWithChildren, useContext, useState } from "react";

const storageKey = "ui-theme";

export type Theme = "light" | "dark";

type ThemeContext = { theme: Theme; setTheme: (val: Theme) => void };

const ThemeContext = createContext<ThemeContext | null>(null);

export function ThemeProvider({
  children,
  theme,
}: PropsWithChildren<{ theme: Theme }>) {
  const [_theme, _setTheme] = useState(theme);
  const router = useRouter();

  function setTheme(val: Theme) {
    setThemeSeverFn({ data: val });
    router.invalidate();
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const getThemeSeverFn = createServerFn().handler(async () => {
  return (getCookie(storageKey) || "light") as Theme;
});

const setThemeSeverFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data != "string" && (data != "dark" || data != "light"))
      throw new Error("Invalid theme provided");
    return data as Theme;
  })
  .handler(async ({ data }) => {
    setCookie(storageKey, data);
  });

export function useTheme() {
  const val = useContext(ThemeContext);
  if (!val) throw new Error("useTheme called outside of ThemeProvider");
  return val;
}
