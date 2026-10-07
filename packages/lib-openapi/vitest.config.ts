import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      // Tests run against source; `#read-file` normally resolves into dist/.
      "#read-file": fileURLToPath(new URL("./src/load/read-file.node.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
})
