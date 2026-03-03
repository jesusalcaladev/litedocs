import fastGlob from "fast-glob";
import path from "path";
import GithubSlugger from "github-slugger";
import { LitedocsConfig } from "./config";
import { FileCache } from "./cache";
import {
  normalizePath,
  parseFrontmatter,
  fileToRoutePath,
  capitalize,
  stripNumberPrefix,
  extractNumberPrefix,
} from "./utils";

// ─── Types ───────────────────────────────────────────────

/**
 * Metadata representing a single documentation route.
 * This information is used to build the client-side router and the sidebar navigation.
 */
export interface RouteMeta {
  /** The final URL path for the route (e.g., '/docs/guide/start') */
  path: string;
  /** The absolute filesystem path to the source markdown/mdx file */
  componentPath: string;
  /** The title of the page, usually extracted from frontmatter or the filename */
  title: string;
  /** The relative path from the docs directory, used for edit links */
  filePath: string;
  /** Optional description of the page (for SEO/meta tags) */
  description?: string;
  /** Optional explicit position for ordering in the sidebar */
  sidebarPosition?: number;
  /** The group (directory) this route belongs to */
  group?: string;
  /** The display title for the route's group */
  groupTitle?: string;
  /** Optional explicit position for ordering the group itself */
  groupPosition?: number;
  /** Extracted markdown headings for search indexing */
  headings?: { level: number; text: string; id: string }[];
  /** The locale this route belongs to, if i18n is configured */
  locale?: string;
  /** Optional badge to display next to the sidebar item (e.g., 'New', 'Experimental') */
  badge?: string | { text: string; expires?: string };
}

/**
 * Internal representation of a parsed documentation file before finalizing groups.
 * Stored in the file cache to avoid re-parsing unchanged files.
 */
interface ParsedDocFile {
  /** The core route metadata without group-level details (inferred later) */
  route: Omit<RouteMeta, "group" | "groupTitle" | "groupPosition">;
  /** The base directory of the file (used to group files together) */
  relativeDir?: string;
  /** Whether this file is the index file for its directory group */
  isGroupIndex: boolean;
  /** If this is a group index, any specific frontmatter metadata dictating the group's title and position */
  groupMeta?: { title: string; position?: number };
  /** Extracted group position from the directory name if it has a numeric prefix */
  inferredGroupPosition?: number;
}

// ─── Cache ───────────────────────────────────────────────
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

// ─── Parsing ─────────────────────────────────────────────
/**
 * Parses a single Markdown/MDX file and extracts its metadata for routing.
 * Checks frontmatter for explicit titles, descriptions, and sidebar positions.
 *
 * @param file - The absolute path to the file
 * @param docsDir - The root documentation directory (e.g., 'docs')
 * @param basePath - The base URL path for the routes (default: '/docs')
 * @returns A parsed structure ready for route assembly and caching
 */
function parseDocFile(
  file: string,
  docsDir: string,
  basePath: string,
  config?: LitedocsConfig,
): ParsedDocFile {
  const { data, content } = parseFrontmatter(file);
  const relativePath = normalizePath(path.relative(docsDir, file));
  let parts = relativePath.split("/");

  let locale: string | undefined;
  if (config?.i18n && parts.length > 0) {
    const potentialLocale = parts[0];
    if (config.i18n.locales[potentialLocale]) {
      locale = potentialLocale;
      parts = parts.slice(1);
    }
  }

  const cleanRelativePath = parts.join("/");
  const cleanRoutePath = fileToRoutePath(cleanRelativePath || "index.md");

  let finalPath = basePath + (cleanRoutePath === "/" ? "" : cleanRoutePath);
  if (locale) {
    finalPath =
      basePath + "/" + locale + (cleanRoutePath === "/" ? "" : cleanRoutePath);
  }
  if (!finalPath) finalPath = "/";

  const rawFileName = parts[parts.length - 1];
  const cleanFileName = stripNumberPrefix(rawFileName);
  const inferredTitle = stripNumberPrefix(
    path.basename(file, path.extname(file)),
  );
  const sidebarPosition =
    data.sidebarPosition ?? extractNumberPrefix(rawFileName);

  const rawDirName = parts.length >= 2 ? parts[0] : undefined;
  const cleanDirName = rawDirName ? stripNumberPrefix(rawDirName) : undefined;

  const isGroupIndex = parts.length >= 2 && /^index\.mdx?$/.test(cleanFileName);

  const headings: { level: number; text: string; id: string }[] = [];
  const slugger = new GithubSlugger();
  const headingsRegex = /^(#{2,4})\s+(.+)$/gm;
  let match;
  while ((match = headingsRegex.exec(content)) !== null) {
    const level = match[1].length;
    // Strip simple markdown formatting specifically for the plain-text search index
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/[_*`]/g, "")
      .trim();
    const id = slugger.slug(text);
    headings.push({ level, text, id });
  }

  return {
    route: {
      path: finalPath,
      componentPath: file,
      filePath: relativePath,
      title: data.title || inferredTitle,
      description: data.description || "",
      sidebarPosition,
      headings,
      locale,
      badge: data.badge,
    },
    relativeDir: cleanDirName,
    isGroupIndex,
    groupMeta: isGroupIndex
      ? {
          title:
            data.groupTitle ||
            data.title ||
            (cleanDirName ? capitalize(cleanDirName) : ""),
          position:
            data.groupPosition ??
            data.sidebarPosition ??
            (rawDirName ? extractNumberPrefix(rawDirName) : undefined),
        }
      : undefined,
    inferredGroupPosition: rawDirName
      ? extractNumberPrefix(rawDirName)
      : undefined,
  };
}

// ─── Sorting ─────────────────────────────────────────────
/**
 * Sorts an array of generated routes.
 * Ungrouped items come first. Items within the same group are sorted by position, then alphabetically.
 * Groups are sorted relative to each other by their group position, then alphabetically.
 *
 * @param routes - The unsorted routes
 * @returns A new array of sorted routes suitable for sidebar generation
 */
function sortRoutes(routes: RouteMeta[]): RouteMeta[] {
  return routes.sort((a, b) => {
    // Ungrouped first
    if (!a.group && !b.group) return compareByPosition(a, b);
    if (!a.group) return -1;
    if (!b.group) return 1;

    // Different groups: sort by group position
    if (a.group !== b.group) {
      return compareByGroupPosition(a, b);
    }

    // Same group: sort by item position
    return compareByPosition(a, b);
  });
}

function compareByPosition(a: RouteMeta, b: RouteMeta): number {
  if (a.sidebarPosition !== undefined && b.sidebarPosition !== undefined)
    return a.sidebarPosition - b.sidebarPosition;
  if (a.sidebarPosition !== undefined) return -1;
  if (b.sidebarPosition !== undefined) return 1;
  return a.title.localeCompare(b.title);
}

function compareByGroupPosition(a: RouteMeta, b: RouteMeta): number {
  if (a.groupPosition !== undefined && b.groupPosition !== undefined)
    return a.groupPosition - b.groupPosition;
  if (a.groupPosition !== undefined) return -1;
  if (b.groupPosition !== undefined) return 1;
  return (a.groupTitle || a.group!).localeCompare(b.groupTitle || b.group!);
}

// ─── Route Generation ────────────────────────────────────
/**
 * Generates the entire route map for the documentation site.
 * This reads all `.md` and `.mdx` files in the `docsDir`, parses them (using cache),
 * infers group hierarchies based on directory structure and `index.md` files,
 * and returns a sorted array of RouteMeta objects intended for the client.
 *
 * @param docsDir - The root directory containing markdown files
 * @param basePath - The base URL path to prefix to generated routes (e.g., '/docs')
 * @returns A promise that resolves to the final list of RouteMeta objects
 */
export async function generateRoutes(
  docsDir: string,
  config?: LitedocsConfig,
  basePath: string = "/docs",
): Promise<RouteMeta[]> {
  const files = await fastGlob(["**/*.md", "**/*.mdx"], {
    cwd: docsDir,
    absolute: true,
  });

  // Prune cache entries for deleted files
  docCache.pruneStale(new Set(files));

  // Invalidate all caches if config changes drastically, but for now we'll just parse.
  // Actually, to clear old cache from before i18n was configured during dev:
  if (config?.i18n) {
    docCache.invalidateAll();
  }

  // Parse files (using cache for unchanged files)
  const parsed: ParsedDocFile[] = files.map((file) => {
    const cached = docCache.get(file);
    if (cached) return cached;

    const result = parseDocFile(file, docsDir, basePath, config);
    docCache.set(file, result);
    return result;
  });

  // Collect group metadata from directory names and index files
  const groupMeta = new Map<string, { title: string; position?: number }>();
  for (const p of parsed) {
    if (p.relativeDir) {
      if (!groupMeta.has(p.relativeDir)) {
        groupMeta.set(p.relativeDir, {
          title: capitalize(p.relativeDir),
          position: p.inferredGroupPosition,
        });
      } else {
        const entry = groupMeta.get(p.relativeDir)!;
        if (
          entry.position === undefined &&
          p.inferredGroupPosition !== undefined
        ) {
          entry.position = p.inferredGroupPosition;
        }
      }
    }

    if (p.isGroupIndex && p.relativeDir && p.groupMeta) {
      const entry = groupMeta.get(p.relativeDir)!;
      entry.title = p.groupMeta.title;
      if (p.groupMeta.position !== undefined) {
        entry.position = p.groupMeta.position;
      }
    }
  }

  // Build final routes with group info
  const routes: RouteMeta[] = parsed.map((p) => {
    const dir = p.relativeDir;
    const meta = dir ? groupMeta.get(dir) : undefined;

    return {
      ...p.route,
      group: dir,
      groupTitle: meta?.title || (dir ? capitalize(dir) : undefined),
      groupPosition: meta?.position,
    };
  });

  // Add fallbacks if i18n is enabled
  if (config?.i18n) {
    const defaultLocale = config.i18n.defaultLocale;
    const allLocales = Object.keys(config.i18n.locales);

    const fallbackRoutes: RouteMeta[] = [];
    const defaultRoutes = routes.filter(
      (r) => (r.locale || defaultLocale) === defaultLocale,
    );

    for (const locale of allLocales) {
      if (locale === defaultLocale) continue;

      const localeRoutePaths = new Set(
        routes.filter((r) => r.locale === locale).map((r) => r.path),
      );

      for (const defRoute of defaultRoutes) {
        let cleanRoutePath = defRoute.path.substring(basePath.length);

        // Strip the default locale prefix if it was added (to avoid /docs/es/en/...)
        if (cleanRoutePath.startsWith("/" + defaultLocale + "/")) {
          cleanRoutePath = cleanRoutePath.substring(defaultLocale.length + 1);
        } else if (cleanRoutePath === "/" + defaultLocale) {
          cleanRoutePath = "/";
        }

        const targetPath =
          basePath +
          "/" +
          locale +
          (cleanRoutePath === "/" ? "" : cleanRoutePath);

        if (!localeRoutePaths.has(targetPath)) {
          // Add fallback route pointing to the english source file, but translated path
          fallbackRoutes.push({
            ...defRoute,
            path: targetPath,
            locale: locale,
          });
        }
      }
    }

    return sortRoutes([...routes, ...fallbackRoutes]);
  }

  return sortRoutes(routes);
}
