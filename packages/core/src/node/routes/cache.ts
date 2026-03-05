import { FileCache } from "../cache";
import { ParsedDocFile } from "./types";

const docCache = new FileCache<ParsedDocFile>();

/**
 * Invalidate all cached routes.
 * Typically called when a file is added or deleted, requiring a complete route rebuild.
 */
export function invalidateRouteCache(): void {
  docCache.invalidateAll();
}

/**
 * Invalidate a specific file from cache.
 * Called when a specific file is modified (changed).
 *
 * @param filePath - The absolute path of the file to invalidate
 */
export function invalidateFile(filePath: string): void {
  docCache.invalidate(filePath);
}

export { docCache };
