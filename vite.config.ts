/// <reference types="vitest" />
import * as path from "path"
import { loadEnv } from "vite"
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()] as any,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Base path is now configured via VITE_BASE_PATH in .env files
    // Development: "/" (root)
    // Production: "/coresplorer/" (GitHub Pages)
    base: env.VITE_BASE_PATH || "/",
  build: {
    outDir: "dist", // Output to dist folder (default)
    emptyOutDir: true, // Clear the directory before building
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: [
            "@radix-ui/react-slot",
            "@radix-ui/react-dialog",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "lucide-react",
          ],
          graph: ["vis-network", "vis-data"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.ts",
    testTimeout: 10000, // 10 seconds
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/*.config.{ts,js}",
        "**/index.ts", // Barrel exports
        "**/*.d.ts", // Type declarations
        "**/types.ts", // Type-only files
        "**/constants.ts", // Constants (can be tested if logic-heavy)
        "e2e/",
        "dist/",
        "docs/",
      ],
      include: ["src/**/*.{ts,tsx}"],
      all: true,
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },
  },
}})
