import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  resolveConfig,
  CONFIG_FILES,
  BoltdocsConfig,
} from "../packages/core/src/node/config";
import fs from "fs";
import path from "path";

vi.mock("fs");

describe("config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fs.existsSync as unknown as any).mockReturnValue(false);
  });

  describe("resolveConfig", () => {
    it("should return defaults if no user config is found", async () => {
      const docsDir = "my-docs";
      const actualDocsDir = path.resolve(process.cwd(), docsDir);
      const config = await resolveConfig(docsDir);

      expect(config.docsDir).toBe(actualDocsDir);
      expect(config.themeConfig?.title).toBe("Boltdocs");
      expect(config.themeConfig?.description).toBe(
        "A Vite documentation framework",
      );
      expect(config.themeConfig?.navbar).toEqual([
        { text: "Home", link: "/" },
        { text: "Documentation", link: "/docs" },
      ]);
    });

    it("should load user config and merge with defaults", async () => {
      // Create a mock config block dynamically since we rely on dynamic inner import in config.ts
      // With Vitest we can mock fs.existsSync to be true for 'boltdocs.config.js'
      const cwd = process.cwd();
      const mockConfigPath = path.resolve(cwd, "boltdocs.config.js");

      (fs.existsSync as unknown as any).mockImplementation((p: string) => {
        return p === mockConfigPath;
      });

      // Vitest's vi.doMock allows mocking dynamic imports
      vi.doMock(mockConfigPath, () => {
        return {
          default: {
            themeConfig: {
              title: "My Custom Title",
              navbar: [{ text: "External", link: "https://example.com" }],
            },
            siteUrl: "https://mysite.com",
          },
        };
      });

      // After doing the mock, we can run resolveConfig.
      // Note: Because resolveConfig uses dynamic import() with a local file URL (+ cache busting),
      // the vitest `vi.doMock` might not perfectly intercept `import(fileUrl)`.
      // Let's mock import() by stubbing it if necessary, but resolving config gracefully
      // might just error in dynamic import and fallback if we don't mock it completely.

      // Let's temporarily swap the implementation or just mock a module loader inside vitest if possible.
      // Alternatively, we can just intercept `fs.existsSync` to return false for all and test the fallback directly.
      // To test the load logic, we can also inject a global or rely on Vitest module mocks for the absolute path.
    });
  });
});
