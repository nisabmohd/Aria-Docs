import type { JsonObject, JsonValue } from "@ariadocs/core"

// Documents are parsed from JSON, or from YAML with the core schema, which
// yields only JSON values. These casts record that for the output types.

export const asJson = (value: unknown): JsonValue | undefined => value as JsonValue | undefined

export const asJsonObject = (value: Record<string, unknown>): JsonObject => value as JsonObject
