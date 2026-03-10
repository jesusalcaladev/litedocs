import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  normalizePath,
  stripNumberPrefix,
  extractNumberPrefix,
  isDocFile,
  getFileMtime,
  parseFrontmatter,
  escapeHtml,
  escapeXml,
  fileToRoutePath,
  capitalize,
} from "../packages/core/src/node/utils";
import fs from "fs";

vi.mock("fs");

describe("utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("normalizePath", () => {
    it("should replace backslashes with forward slashes", () => {
      expect(normalizePath("C:\\path\\to\\file")).toBe("C:/path/to/file");
      expect(normalizePath("foo\\bar\\baz")).toBe("foo/bar/baz");
      expect(normalizePath("foo/bar/baz")).toBe("foo/bar/baz");
    });
  });

  describe("stripNumberPrefix", () => {
    it("should remove numeric prefixes from names", () => {
      expect(stripNumberPrefix("1.guide")).toBe("guide");
      expect(stripNumberPrefix("01.guide")).toBe("guide");
      expect(stripNumberPrefix("100.advanced")).toBe("advanced");
      expect(stripNumberPrefix("guide")).toBe("guide");
    });
    it("should not affect numbers elsewhere in the string", () => {
      expect(stripNumberPrefix("1.test2")).toBe("test2");
      expect(stripNumberPrefix("test.1")).toBe("test.1");
    });
  });

  describe("extractNumberPrefix", () => {
    it("should extract the numeric prefix as a number", () => {
      expect(extractNumberPrefix("1.guide")).toBe(1);
      expect(extractNumberPrefix("05.test")).toBe(5);
      expect(extractNumberPrefix("123.file")).toBe(123);
    });
    it("should return undefined if no numeric prefix exists", () => {
      expect(extractNumberPrefix("guide")).toBeUndefined();
      expect(extractNumberPrefix("guide.1")).toBeUndefined();
    });
  });

  describe("isDocFile", () => {
    it("should return true for .md and .mdx files", () => {
      expect(isDocFile("test.md")).toBe(true);
      expect(isDocFile("test.mdx")).toBe(true);
      expect(isDocFile("/path/to/test.md")).toBe(true);
    });
    it("should return false for other extensions", () => {
      expect(isDocFile("test.txt")).toBe(false);
      expect(isDocFile("test.md.txt")).toBe(false);
      expect(isDocFile("test.ts")).toBe(false);
    });
  });

  describe("getFileMtime", () => {
    it("should return mtimeMs if file exists", () => {
      (fs.statSync as unknown as any).mockReturnValue({ mtimeMs: 12345 });
      expect(getFileMtime("test.md")).toBe(12345);
      expect(fs.statSync).toHaveBeenCalledWith("test.md");
    });
    it("should return 0 if file does not exist or error occurs", () => {
      (fs.statSync as unknown as any).mockImplementation(() => {
        throw new Error("File not found");
      });
      expect(getFileMtime("missing.md")).toBe(0);
    });
  });

  describe("parseFrontmatter", () => {
    it("should parse frontmatter and content correctly", () => {
      const mockMarkdown = `---
title: Test Title
description: Test Description
---
# Hello World`;
      (fs.readFileSync as unknown as any).mockReturnValue(mockMarkdown);

      const { data, content } = parseFrontmatter("test.md");
      expect(data).toEqual({
        title: "Test Title",
        description: "Test Description",
      });
      expect(content.trim()).toBe("# Hello World");
      expect(fs.readFileSync).toHaveBeenCalledWith("test.md", "utf-8");
    });

    it("should handle files without frontmatter", () => {
      const mockMarkdown = `# Hello World`;
      (fs.readFileSync as unknown as any).mockReturnValue(mockMarkdown);

      const { data, content } = parseFrontmatter("test.md");
      expect(data).toEqual({});
      expect(content.trim()).toBe("# Hello World");
    });
  });

  describe("escapeHtml / escapeXml", () => {
    it("should escape special characters", () => {
      const input = `<div class="test" data-val='1'>Testing & escaping</div>`;
      const expected = `&lt;div class=&quot;test&quot; data-val=&apos;1&apos;&gt;Testing &amp; escaping&lt;/div&gt;`;
      expect(escapeHtml(input)).toBe(expected);
      expect(escapeXml(input)).toBe(expected);
    });
  });

  describe("fileToRoutePath", () => {
    it("should convert relative paths to routes correctly", () => {
      expect(fileToRoutePath("guide/index.md")).toBe("/guide");
      expect(fileToRoutePath("1.guide/1.getting-started.mdx")).toBe(
        "/guide/getting-started",
      );
      expect(fileToRoutePath("index.md")).toBe("/");
      expect(fileToRoutePath("api/reference.md")).toBe("/api/reference");
    });
    it("should ensure leading slash and no trailing slash", () => {
      expect(fileToRoutePath("folder/")).toBe("/folder");
      expect(fileToRoutePath("/folder/")).toBe("/folder");
      expect(fileToRoutePath("/")).toBe("/");
    });
    it("should leave the root index alone", () => {
      expect(fileToRoutePath("index")).toBe("/");
    });
  });

  describe("capitalize", () => {
    it("should capitalize the first letter of a string", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("hello world")).toBe("Hello world");
      expect(capitalize("")).toBe("");
      expect(capitalize("H")).toBe("H");
    });
  });
});
