import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ["src/**/*.test.ts", "apps-script/**/*.test.ts"],
    environment: "node",
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
