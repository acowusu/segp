import { defineWorkspace } from "vitest/config";

// defineWorkspace provides a nice type hinting DX
export default defineWorkspace([
  {
    // add "extends" to merge two configs together
    extends: "./vitest.config.ts",
    test: {
      globals: true,
      setupFiles: ["./src/lib/test-setup.ts"],
      include: ["src/**/*.test.{ts,tsx}"],
      name: "jsdom",
      environment: "jsdom",

    },
  },
  {
    extends: "./vitest.config.ts",
    test: {
      include: ["electron/**/*.test.{ts,tsx}"],
      name: "node",
      environment: "node",
    },
  },
]);
