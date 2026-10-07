"use client"

import { useEffect, useState } from "react"
import { OpenAPI } from "@ariadocs/components"
import { parseOpenAPI, type APISpec } from "@ariadocs/openapi"

const INITIAL = `openapi: 3.1.0
info:
  title: Todo API
  version: 1.0.0
servers:
  - url: https://todo.example.com
paths:
  /todos/{id}:
    get:
      operationId: getTodo
      summary: Get a todo
      description: Returns a single **todo** by id.
      parameters:
        - name: id
          in: path
          schema: { type: integer, minimum: 1 }
      responses:
        "200":
          description: The todo
          content:
            application/json:
              schema:
                type: object
                required: [id, title]
                properties:
                  id: { type: integer, example: 1 }
                  title: { type: string, example: Buy milk }
                  done: { type: boolean, default: false }
        "404":
          description: Not found
`

/**
 * Parses YAML in the browser with @ariadocs/openapi and renders it with
 * @ariadocs/components — no server involved. File and network access are
 * disabled because the text is user input.
 */
export function ClientParseDemo() {
  const [text, setText] = useState(INITIAL)
  const [api, setApi] = useState<APISpec | undefined>()
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      parseOpenAPI({ source: text, allowFiles: false, allowRemote: false, maxSize: 512 * 1024 })
        .then((result) => {
          if (cancelled) return
          setApi(result)
          setError(undefined)
        })
        .catch((cause: unknown) => {
          if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause))
        })
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [text])

  return (
    <div className="not-prose my-6 grid grid-cols-[minmax(0,1fr)] gap-4">
      <label className="grid gap-2 text-sm">
        <span className="text-muted-foreground text-xs font-medium">OpenAPI document (edit me)</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
          rows={14}
          className="bg-muted/40 focus-visible:ring-ring rounded-xl border p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2"
        />
      </label>
      {error !== undefined ? (
        <pre className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs whitespace-pre-wrap text-red-600 dark:text-red-400">
          {error}
        </pre>
      ) : null}
      {api !== undefined ? (
        <div className="bg-background rounded-xl border p-4 sm:p-6">
          <OpenAPI.Root api={api}>
            {api.operations.length === 0 ? (
              <p className="text-muted-foreground text-sm">No operations.</p>
            ) : (
              api.operations.map((operation) => <OpenAPI.Operation key={operation.id} operation={operation} />)
            )}
          </OpenAPI.Root>
        </div>
      ) : null}
    </div>
  )
}
