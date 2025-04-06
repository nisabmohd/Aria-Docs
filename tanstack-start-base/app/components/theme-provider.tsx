import { setThemeSeverFn } from "@/lib/theme";
import { useRouter } from "@tanstack/react-router";

import { createContext, PropsWithChildren, useContext, useState } from "react";

export type Theme = "light" | "dark";

type ThemeContextVal = { theme: Theme; setTheme: (val: Theme) => void };

const ThemeContext = createContext<ThemeContextVal | null>(null);

export function ThemeProvider({
  children,
  theme,
}: PropsWithChildren<{ theme: Theme }>) {
  const [_theme, _setTheme] = useState(theme);
  const router = useRouter();

  function setTheme(val: Theme) {
    setThemeSeverFn({ data: val });
    _setTheme(val);
    router.invalidate();
  }

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}

export function useTheme() {
  const val = useContext(ThemeContext);
  if (!val) throw new Error("useTheme called outside of ThemeProvider");
  return val;
}

type Props = PropsWithChildren<{ theme: Theme }>;
