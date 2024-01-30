import { configDefaults, defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  await viteConfig,
  defineConfig({
    test: {
      includeSource: ["**/*.ts", "**/*.tsx"],
      exclude: [...configDefaults.exclude, "**/*.js"],
      coverage: {
        // you can include other reporters, but 'json-summary' is required, json is recommended
        reporter: ["text", "json-summary", "json"],
        extension:['.ts', '.tsx'],
        include:["src/**", "electron/**"],
        // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
        reportOnFailure: true,
      },
    },
  })
);
