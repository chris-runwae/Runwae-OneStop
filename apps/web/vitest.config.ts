import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@/convex": resolve(__dirname, "../../packages/convex/convex"),
      "@": resolve(__dirname, "."),
    },
  },
});
