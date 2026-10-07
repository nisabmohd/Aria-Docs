import type { JsonObject, JsonValue } from "@ariadocs/core";

/**
 * JSON-Schema-flavored schema model used across the Ariadocs OpenAPI pipeline.
 *
 * Designed around OpenAPI 3.1's full JSON Schema vocabulary (which is a
 * superset of the 3.0 subset). Schemas that originated from a `$ref` keep the
 * original pointer in `ref` so tooling always knows where a schema came from.
 */
export interface APISchema {
  /** JSON Schema type. OpenAPI 3.1 allows arrays (e.g. `["string", "null"]`). */
  type?: string | string[];
  title?: string;
  description?: string;
  format?: string;
  /** OpenAPI 3.0 style nullability. 3.1 uses `type: ["null", ...]` instead. */
  nullable?: boolean;
  default?: JsonValue;
  example?: JsonValue;
  examples?: JsonValue[];
  enum?: JsonValue[];
  const?: JsonValue;

  // Numbers
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number | boolean;
  exclusiveMaximum?: number | boolean;
  multipleOf?: number;

  // Strings
  minLength?: number;
  maxLength?: number;
  pattern?: string;

  // Objects
  required?: string[];
  properties?: Record<string, APISchema>;
  additionalProperties?: boolean | APISchema;
  minProperties?: number;
  maxProperties?: number;

  // Arrays
  items?: APISchema | APISchema[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;

  // Composition
  allOf?: APISchema[];
  anyOf?: APISchema[];
  oneOf?: APISchema[];
  not?: APISchema;
  discriminator?: APISchemaDiscriminator;

  // OpenAPI-specific
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;

  /** Original `$ref` pointer this schema was resolved from. */
  ref?: string;
  /** Unresolved reference (present when a `$ref` could not be resolved, e.g. external refs). */
  "$ref"?: string;
  /** The original schema object, when parsed with `includeRaw: true`. */
  raw?: JsonObject;
}

export interface APISchemaDiscriminator {
  propertyName: string;
  mapping?: Record<string, string>;
}

/**
 * A first-class schema property, ready for recursive tree rendering
 * (`User ├── id ├── name ...`).
 */
export interface APISchemaProperty {
  name: string;
  schema: APISchema;
  required: boolean;
  description?: string;
  deprecated: boolean;
  readOnly: boolean;
  writeOnly: boolean;
}
