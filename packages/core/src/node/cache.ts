import { getFileMtime } from "./utils";

/**
 * Per-file cache entry. Stores parsed data + the mtime at parse time.
 */
interface FileCacheEntry<T> {
  data: T;
  mtime: number;
}

/**
 * Generic file-based cache with per-file granularity.
 * Only re-parses files whose mtime has changed.
 */
export class FileCache<T> {
  private entries = new Map<string, FileCacheEntry<T>>();

  /**
   * Retrieves parsed data for a file from the cache.
   * Compares the current filesystem mtime with the cached mtime.
   *
   * @param filePath - The absolute path of the file
   * @returns The cached data if valid, or `null` if the file has changed or doesn't exist
   */
  get(filePath: string): T | null {
    const entry = this.entries.get(filePath);
    if (!entry) return null;

    const currentMtime = getFileMtime(filePath);
    if (currentMtime !== entry.mtime) return null;

    return entry.data;
  }

  /**
   * Stores parsed data for a file in the cache, recording its current mtime.
   *
   * @param filePath - The absolute path to the file
   * @param data - The parsed data to store
   */
  set(filePath: string, data: T): void {
    this.entries.set(filePath, {
      data,
      mtime: getFileMtime(filePath),
    });
  }

  /**
   * Checks if a specific file's cache is still valid (based on its mtime).
   *
   * @param filePath - The absolute path to the file
   * @returns `true` if the cache is valid, `false` otherwise
   */
  isValid(filePath: string): boolean {
    return this.get(filePath) !== null;
  }

  /**
   * Manually removes a specific file from the cache.
   * Useful when forcefully invalidating a single updated file.
   *
   * @param filePath - The absolute path to the file
   */
  invalidate(filePath: string): void {
    this.entries.delete(filePath);
  }

  /**
   * Clears the entire cache, forcing all files to be re-parsed on the next request.
   * Useful when global dependencies (like config) change.
   */
  invalidateAll(): void {
    this.entries.clear();
  }

  /**
   * Removes cached entries for files that no longer exist on the filesystem.
   * Prevents memory leaks from deleted files.
   *
   * @param currentFiles - A Set of absolute file paths currently discovered on the disk
   */
  pruneStale(currentFiles: Set<string>): void {
    for (const key of this.entries.keys()) {
      if (!currentFiles.has(key)) {
        this.entries.delete(key);
      }
    }
  }

  /** Number of cached entries */
  get size(): number {
    return this.entries.size;
  }
}
