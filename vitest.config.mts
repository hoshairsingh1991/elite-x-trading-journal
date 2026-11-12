import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(
  new URL(".", import.meta.url)
);

export default defineConfig({
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },

  test: {
    environment: "node",

    clearMocks: true,
    restoreMocks: true,

    include: [
      "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],

    exclude: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/.vercel/**",
    ],
  },
});
