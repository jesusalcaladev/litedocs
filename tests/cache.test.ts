import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  FileCache,
  TransformCache,
  AssetCache,
  flushCache,
} from "../packages/core/src/node/cache";
import * as utils from "../packages/core/src/node/utils";
import fs from "fs";
import zlib from "zlib";

vi.mock("fs");
vi.mock("zlib");
vi.mock("util", async (importOriginal) => {
  const actual = await importOriginal<typeof import("util")>();
  return {
    ...actual,
    promisify: vi.fn(() => vi.fn().mockResolvedValue(Buffer.from("mocked"))),
  };
});
vi.mock("../packages/core/src/node/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof utils>();
  return {
    ...actual,
    getFileMtime: vi.fn(),
  };
});

// Polyfill process.env
const originalEnv = process.env;

describe("cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, BOLTDOCS_NO_CACHE: "0" };
    (utils.getFileMtime as ReturnType<typeof vi.fn>).mockReturnValue(12345);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("FileCache", () => {
    it("should get and set cache values correctly", () => {
      const cache = new FileCache<string>({ name: "test", compress: false });
      cache.set("file.md", "content");

      expect(cache.isValid("file.md")).toBe(true);
      expect(cache.get("file.md")).toBe("content");

      // If mtime changes, it should become invalid
      (utils.getFileMtime as ReturnType<typeof vi.fn>).mockReturnValue(67890);
      expect(cache.isValid("file.md")).toBe(false);
      expect(cache.get("file.md")).toBeNull();
    });

    it("should skip loading if BOLTDOCS_NO_CACHE=1", () => {
      process.env.BOLTDOCS_NO_CACHE = "1";
      const cache = new FileCache<string>({ name: "test", compress: false });
      cache.load();
      expect(fs.existsSync).not.toHaveBeenCalled();
    });

    it("should invalidate entries", () => {
      const cache = new FileCache<string>({ name: "test", compress: false });
      cache.set("file.md", "content");
      cache.invalidate("file.md");
      expect(cache.get("file.md")).toBeNull();
    });
  });

  describe("TransformCache", () => {
    it("should fallback to null if no cache is found", () => {
      const cache = new TransformCache("test");
      expect(cache.get("missing.md")).toBeNull();
    });

    it("should store and retrieve values in memory", () => {
      const cache = new TransformCache("test");
      cache.set("test.md", "transformed-content");
      expect(cache.get("test.md")).toBe("transformed-content");
      expect(cache.size).toBe(1);
    });

    it("should handle batch getMany requests", async () => {
      const cache = new TransformCache("test");
      cache.set("test1.md", "content1");
      cache.set("test2.md", "content2");

      const results = await cache.getMany([
        "test1.md",
        "test2.md",
        "missing.md",
      ]);
      expect(results.get("test1.md")).toBe("content1");
      expect(results.get("test2.md")).toBe("content2");
      expect(results.has("missing.md")).toBe(false);
    });
  });

  describe("AssetCache", () => {
    it("should handle clear correctly", () => {
      const cache = new AssetCache();
      (fs.existsSync as unknown as any).mockReturnValue(true);
      cache.clear();
      expect(fs.rmSync).toHaveBeenCalled();
    });

    it("should return null if source doesn't exist", () => {
      const cache = new AssetCache();
      (fs.existsSync as unknown as any).mockReturnValue(false);
      expect(cache.get("missing.png", "key")).toBeNull();
    });
  });

  describe("flushCache", () => {
    it("should flush background queues", async () => {
      await expect(flushCache()).resolves.toBeUndefined();
    });
  });
});
