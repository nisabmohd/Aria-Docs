"use client";

import { Laptop2, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeMode() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-row gap-1 items-center">
      <Button
        onClick={() => setTheme("light")}
        size={"icon"}
        className="rounded-full"
        variant={theme == "light" ? "secondary" : "ghost"}
      >
        <Sun className={`w-5 h-5  ${theme == "light" ? "anchor" : ""}`} />
      </Button>
      <Button
        onClick={() => setTheme("system")}
        size={"icon"}
        className="rounded-full"
        variant={theme == "system" ? "secondary" : "ghost"}
      >
        <Laptop2 className={`w-5 h-5  ${theme == "system" ? "anchor" : ""}`} />
      </Button>
      <Button
        onClick={() => setTheme("dark")}
        size={"icon"}
        className="rounded-full"
        variant={theme == "dark" ? "secondary" : "ghost"}
      >
        <Moon className={`w-5 h-5  ${theme == "dark" ? "anchor" : ""}`} />
      </Button>
    </div>
  );
}
