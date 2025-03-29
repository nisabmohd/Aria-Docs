import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Thursday, May 23, 2024
export function formatDate(dateStr: string): string {
  const [day, month, year] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
}

//  May 23, 2024
export function formatDate2(dateStr: string): string {
  const [day, month, year] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

export function stringToDate(date: string) {
  const [day, month, year] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// https://devicon.dev/
//  icon format : <i class="devicon-go-plain"></i>
export const fileExtensionIconMap = {
  js: "javascript",
  ts: "typescript",
  jsx: "react",
  tsx: "react",
  java: "java",
  css: "css3",
  md: "markdown",
  mdx: "markdown",
  go: "go",
  astro: "astro",
  prisma: "prisma",
  py: "python",
  kt: "kotlin",
  php: "php",
  gitignore: "git",
  cs: "csharp",
  cpp: "cplusplus",
  c: "c",
  bash: "bash",
  html: "html5",
};

export function hasSupportedExtension(name: string) {
  const splittedNames = name.split(".");
  const ext = splittedNames[splittedNames.length - 1];
  if (!ext) return false;
  return !!fileExtensionIconMap[ext as keyof typeof fileExtensionIconMap];
}

export function getIconName(name: string) {
  const splittedNames = name.split(".");
  const ext = splittedNames[splittedNames.length - 1];
  return fileExtensionIconMap[ext as keyof typeof fileExtensionIconMap];
}

export const not_found = "_not_found";
