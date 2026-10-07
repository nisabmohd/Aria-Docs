import { getOwn } from "@ariadocs/core"
import type { APIServer } from "../types/index.js"

/**
 * Fill in a server URL template: `https://{region}.example.com` with
 * `{ region: "eu" }` → `https://eu.example.com`. Missing values fall back to
 * the variable's `default`, then its first `enum` value. Characters other
 * than letters, digits, `-._~` and `/` are percent-encoded, so a value can't
 * inject a query string, fragment or credentials.
 */
export function getServerUrl(server: APIServer, values: Record<string, string> = {}): string {
  return server.url.replace(/\{([^{}]+)\}/g, (match, name: string) => {
    const variable = getOwn(server.variables, name)
    const value = getOwn(values, name) ?? variable?.default ?? variable?.enum?.[0]
    return value === undefined ? match : value.replace(/[^A-Za-z0-9\-._~/]/gu, encodeChar)
  })
}

function encodeChar(char: string): string {
  try {
    return encodeURIComponent(char)
  } catch {
    // Lone surrogate: not encodable.
    return ""
  }
}
