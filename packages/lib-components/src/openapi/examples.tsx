"use client"

import { useMemo, useState } from "react"
import {
  CODE_SAMPLE_LANGUAGES,
  createCodeSample,
  createRequestSample,
  getContentExample,
  type APIOperation,
  type APIResponse,
  type CodeSampleLanguage,
} from "@ariadocs/openapi"
import { ChevronDown } from "lucide-react"
import { CodeBlock, CodeTabs } from "../code/code-block.js"
import { useOperation, useOptionalOpenAPI } from "./context.js"
import { StatusCode } from "./response.js"

export interface RequestExampleProps {
  /** Languages to offer (default: cURL, JavaScript, Python). */
  languages?: CodeSampleLanguage[]
  className?: string
}

/** `<OpenAPI.Operation.RequestExample>` — generated request code with a language switch. */
export function RequestExample({ languages, className }: RequestExampleProps) {
  const operation = useOperation()
  const root = useOptionalOpenAPI()
  const options = CODE_SAMPLE_LANGUAGES.filter((language) => languages === undefined || languages.includes(language.id))
  const [language, setLanguage] = useState<CodeSampleLanguage>(options[0]?.id ?? "curl")

  const sample = useMemo(
    () => createRequestSample(operation, { securitySchemes: root?.api.securitySchemes }),
    [operation, root]
  )
  const current = options.find((option) => option.id === language) ?? options[0]
  if (current === undefined) return null

  return (
    <CodeBlock
      className={className}
      code={createCodeSample(sample, current.id)}
      language={current.syntax}
      title={options.length < 2 ? current.label : undefined}
      actions={
        options.length > 1 ? (
          <label className="text-muted-foreground hover:text-foreground relative inline-flex h-full items-center pl-2.5">
            <span className="sr-only">Language</span>
            <select
              value={current.id}
              onChange={(event) => setLanguage(event.target.value as CodeSampleLanguage)}
              className="text-foreground cursor-pointer appearance-none bg-transparent pr-5 text-(length:--aria-text-sm) outline-none"
            >
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute right-0 size-3.5" />
          </label>
        ) : undefined
      }
    />
  )
}

export interface ResponseExampleProps {
  className?: string
}

/** `<OpenAPI.Operation.ResponseExample>` — example body per status code. */
export function ResponseExample({ className }: ResponseExampleProps) {
  const operation = useOperation()
  const responses = useMemo(() => responsesWithExamples(operation), [operation])
  const [status, setStatus] = useState(responses[0]?.response.status)
  const current = responses.find((item) => item.response.status === status) ?? responses[0]
  if (current === undefined) return null

  return (
    <CodeBlock
      className={className}
      code={current.code}
      language={current.language}
      title="Response"
      actions={
        <CodeTabs
          label="Status"
          value={current.response.status}
          options={responses.map(({ response }) => ({ value: response.status, label: <StatusCode response={response} /> }))}
          onChange={setStatus}
        />
      }
    />
  )
}

function responsesWithExamples(operation: APIOperation) {
  const result: { response: APIResponse; code: string; language: string }[] = []
  for (const response of operation.responses) {
    const content = response.content.find((item) => /json/i.test(item.mediaType)) ?? response.content[0]
    if (content === undefined) continue
    const example = getContentExample(content, "response")
    if (example === undefined) continue
    const json = /json/i.test(content.mediaType)
    result.push({
      response,
      code: typeof example === "string" && !json ? example : JSON.stringify(example, null, 2),
      language: json ? "json" : "text",
    })
  }
  return result
}
