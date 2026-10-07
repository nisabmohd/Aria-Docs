/**
 * A tiny, dependency-free syntax highlighter for the languages the
 * components generate (JSON, shell, JavaScript, Python). It emits Prism's
 * token class names (`token string`, `token keyword`, ...), so the same
 * syntax theme styles generated snippets and MDX code blocks.
 *
 * Output is plain data rendered as React text nodes — never HTML — so
 * highlighting can't introduce markup injection.
 */

export interface Token {
  type?: string
  value: string
}

type Rule = [type: string, pattern: RegExp]

const STRING = /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y
const NUMBER = /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/y
const PUNCTUATION = /[{}[\](),.:;]/y

/** Rules shared by C-family languages: comments, strings, numbers, calls, keywords. */
function cFamily(keywords: string, extra: Rule[] = []): Rule[] {
  return [
    ["comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ...extra,
    ["string", /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])'/y],
    ["keyword", new RegExp(`\\b(?:${keywords})\\b`, "y")],
    ["boolean", /\b(?:true|false|null|nil|None)\b/y],
    ["number", NUMBER],
    ["function", /\b[a-zA-Z_][\w]*(?=\s*[(!])/y],
    ["punctuation", PUNCTUATION],
  ]
}

const RULES: Record<string, Rule[]> = {
  json: [
    ["property", /"(?:\\.|[^"\\\n])*"(?=\s*:)/y],
    ["string", /"(?:\\.|[^"\\\n])*"/y],
    ["number", NUMBER],
    ["boolean", /\b(?:true|false|null)\b/y],
    ["punctuation", PUNCTUATION],
  ],
  bash: [
    ["comment", /#[^\n]*/y],
    ["string", STRING],
    ["function", /(?<=^|\n|\|\s?|&&\s?)[a-zA-Z][\w-]*/y],
    ["keyword", /(?<=\s)-{1,2}[a-zA-Z][\w-]*/y],
    ["operator", /\\(?=\n)|\||&&|>/y],
  ],
  javascript: [
    ["comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ["string", /`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y],
    [
      "keyword",
      /\b(?:const|let|var|await|async|function|return|new|import|from|export|default|if|else|for|of|in|try|catch|throw|class|extends)\b/y,
    ],
    ["boolean", /\b(?:true|false|null|undefined)\b/y],
    ["number", NUMBER],
    ["function", /\b[a-zA-Z_$][\w$]*(?=\()/y],
    ["property", /\b[a-zA-Z_$][\w$]*(?=\s*:)/y],
    ["punctuation", PUNCTUATION],
  ],
  go: cFamily("package|import|func|var|const|type|struct|return|if|else|for|range|defer|go|map|chan|err", [
    ["string", /`[^`]*`/y],
  ]),
  rust: cFamily("use|fn|let|mut|pub|struct|impl|match|if|else|for|in|return|as|Ok|Err|Result|Box|dyn|async|await", [
    ["string", /r(#*)"[\s\S]*?"\1/y],
  ]),
  java: cFamily("import|package|public|private|protected|class|static|void|final|new|return|throws|throw|try|catch|if|else|for|var|String"),
  kotlin: cFamily("import|package|fun|val|var|class|object|return|if|else|when|for|in|null|use", [
    ["string", /"""[\s\S]*?"""/y],
  ]),
  csharp: cFamily("using|var|new|await|async|public|class|static|void|return|if|else|foreach|in|string", [
    ["string", /("{3,})[\s\S]*?\1/y],
  ]),
  python: [
    ["comment", /#[^\n]*/y],
    ["string", /"""[\s\S]*?"""|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y],
    ["keyword", /\b(?:import|from|as|def|return|if|else|elif|for|in|with|try|except|class|lambda|await|async)\b/y],
    ["boolean", /\b(?:True|False|None)\b/y],
    ["number", NUMBER],
    ["function", /\b[a-zA-Z_]\w*(?=\()/y],
    ["punctuation", PUNCTUATION],
  ],
}

const ALIASES: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  curl: "bash",
  js: "javascript",
  ts: "javascript",
  typescript: "javascript",
  py: "python",
  golang: "go",
  rs: "rust",
  kt: "kotlin",
  cs: "csharp",
  "c#": "csharp",
}

/** Split `code` into tokens for `language`. Unknown languages yield one plain token. */
export function tokenize(code: string, language?: string): Token[] {
  const key = language === undefined ? undefined : (ALIASES[language] ?? language)
  const rules = key !== undefined ? RULES[key] : undefined
  if (rules === undefined) return [{ value: code }]

  const tokens: Token[] = []
  let plain = ""
  let index = 0

  outer: while (index < code.length) {
    for (const [type, pattern] of rules) {
      pattern.lastIndex = index
      const match = pattern.exec(code)
      if (match !== null && match[0].length > 0) {
        if (plain !== "") {
          tokens.push({ value: plain })
          plain = ""
        }
        tokens.push({ type, value: match[0] })
        index += match[0].length
        continue outer
      }
    }
    plain += code[index]
    index += 1
  }

  if (plain !== "") tokens.push({ value: plain })
  return tokens
}
