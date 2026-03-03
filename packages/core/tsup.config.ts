import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/node/index.ts",
    "src/node/cli/index.ts",
    "src/client/index.ts",
    "src/client/ssr.tsx",
  ],
  format: ["cjs", "esm"],
  dts: false,
  clean: true,
  external: [
    "vite",
    "react",
    "react-dom",
    "react-router-dom",
    "virtual:litedocs-routes",
    "virtual:litedocs-config",
  ],
});
