import { describe, it, expect, vi, beforeEach } from "vitest";
import { boltdocsMdxPlugin } from "../packages/core/src/node/mdx";

describe("mdx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create an mdx plugin with expected hooks", () => {
    const plugin: any = boltdocsMdxPlugin();

    expect(plugin.name).toBe("vite-plugin-boltdocs-mdx");
    expect(typeof plugin.buildStart).toBe("function");
    expect(typeof plugin.transform).toBe("function");
    expect(typeof plugin.buildEnd).toBe("function");
  });

  it("should transform valid files using the base plugin", async () => {
    const plugin: any = boltdocsMdxPlugin({
      themeConfig: { codeTheme: "one-dark-pro" },
    });

    // Simulate build cycle
    if (plugin.buildStart) {
      await plugin.buildStart.call({} as any);
    }

    const result = await plugin.transform.call({} as any, "# code", "test.md");
    expect(result).toBeDefined();
    expect(result.code).toContain("_createMdxContent");

    if (plugin.buildEnd) {
      await plugin.buildEnd.call({} as any);
    }
  });

  it("should bypass non-md/mdx files", async () => {
    const plugin: any = boltdocsMdxPlugin();

    const result = await plugin.transform.call(
      {} as any,
      "const x = 1",
      "test.ts",
    );
    expect(result).toBeUndefined(); // Should skip our cache logic entirely
  });
});
