import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import litedocs from "litedocs";

// https://vitejs.dev/config/
export default defineConfig(async () => {
  return {
    plugins: [
      react(),
      await litedocs({
        docsDir: "docs",
        homePage: "./src/HomePage.tsx",
      }),
    ],
  };
});
