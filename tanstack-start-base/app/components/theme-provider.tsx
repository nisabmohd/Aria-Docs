import { setThemeServerFn } from "@/lib/theme";
import { useRouter } from "@tanstack/react-router";
import { createContext, PropsWithChildren, use, useState } from "react";

export type Theme = "light" | "dark";

type ThemeContextVal = { theme: Theme; setTheme: (val: Theme) => void };
type Props = PropsWithChildren<{ theme: Theme }>;

const ThemeContext = createContext<ThemeContextVal | null>(null);

export function ThemeProvider({ children, theme }: Props) {
  const [_theme, _setTheme] = useState(theme);
  const router = useRouter();

  function setTheme(val: Theme) {
    setThemeServerFn({ data: val });
    _setTheme(val);
    router.invalidate();
  }

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}

export function useTheme() {
  const val = use(ThemeContext);
  if (!val) throw new Error("useTheme called outside of ThemeProvider!");
  return val;
}
