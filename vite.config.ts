/// <reference types="vitest" />
import * as path from "path"
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()] as any,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Needed for GitHub Pages project site: /<username>.github.io/<repo>/
  base: "/coresplorer/",
  build: {
    outDir: "docs", // Output to root docs folder for GitHub Pages
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
})
