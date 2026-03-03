import path from "path";
import { pathToFileURL } from "url";
import fs from "fs";

/**
 * Represents a single social link in the configuration.
 */
export interface LitedocsSocialLink {
  /** Identifier for the icon (e.g., 'github', 'twitter') */
  icon: "github" | "discord" | "twitter" | "x" | string;
  /** The URL the social link points to */
  link: string;
}

/**
 * Configuration for the site footer.
 */
export interface LitedocsFooterConfig {
  /** Text to display in the footer (HTML is supported) */
  text?: string;
}

/**
 * Theme-specific configuration options governing the appearance and navigation of the site.
 */
export interface LitedocsThemeConfig {
  /** The global title of the documentation site */
  title?: string;
  /** The global description of the site (used for SEO) */
  description?: string;
  /** URL path to the site logo */
  logo?: string;
  /** Items to display in the top navigation bar */
  navbar?: Array<{ text: string; link: string }>;
  /** Items to display in the sidebar, organized optionally by group URLs */
  sidebar?: Record<string, Array<{ text: string; link: string }>>;
  /** Social links to display in the navigation bar */
  socialLinks?: LitedocsSocialLink[];
  /** Site footer configuration */
  footer?: LitedocsFooterConfig;
  /** Whether to show breadcrumbs navigation (default: true) */
  breadcrumbs?: boolean;
  /** Path to a custom CSS file that overrides theme variables */
  customCss?: string;
  /** URL template for 'Edit this page'. Use :path as a placeholder. */
  editLink?: string;
  /** URL for the 'Community help' link. */
  communityHelp?: string;
  /** The current version of the project (e.g., 'v2.8.9'). Displayed in the Navbar. */
  version?: string;
  /** The GitHub repository in the format 'owner/repo' to fetch and display star count. */
  githubRepo?: string;
  /** Whether to show the 'Powered by LiteDocs' badge in the sidebar (default: true) */
  poweredBy?: boolean;
}

/**
 * Configuration for internationalization (i18n).
 */
export interface LitedocsI18nConfig {
  /** The default locale (e.g., 'en') */
  defaultLocale: string;
  /** Available locales and their display names (e.g., { en: 'English', es: 'Español' }) */
  locales: Record<string, string>;
}

/**
 * The root configuration object for Litedocs.
 */
export interface LitedocsConfig {
  /** The base URL of the site, used for generating the sitemap */
  siteUrl?: string;
  /** Configuration pertaining to the UI and appearance */
  themeConfig?: LitedocsThemeConfig;
  /** The root directory containing markdown documentation files (default: 'docs') */
  docsDir?: string;
  /** Configuration for internationalization */
  i18n?: LitedocsI18nConfig;
}

export const CONFIG_FILES = [
  "litedocs.config.js",
  "litedocs.config.mjs",
  "litedocs.config.ts",
];

/**
 * Loads user's configuration file (e.g., `litedocs.config.js` or `litedocs.config.ts`) if it exists,
 * merges it with the default configuration, and returns the final `LitedocsConfig`.
 *
 * @param docsDir - The fallback/default documentation directory
 * @returns A promise resolving to the final merged configuration object
 */
export async function resolveConfig(docsDir: string): Promise<LitedocsConfig> {
  const projectRoot = process.cwd();

  const defaults: LitedocsConfig = {
    docsDir: path.resolve(docsDir),
    themeConfig: {
      title: "Litedocs",
      description: "A Vite documentation framework",
      navbar: [
        { text: "Home", link: "/" },
        { text: "Documentation", link: "/docs" },
      ],
    },
  };

  // Try to load user config
  for (const filename of CONFIG_FILES) {
    const configPath = path.resolve(projectRoot, filename);
    if (fs.existsSync(configPath)) {
      try {
        // Add a timestamp query parameter to bust the ESM cache
        const fileUrl = pathToFileURL(configPath).href + "?t=" + Date.now();
        const mod = await import(fileUrl);
        const userConfig = mod.default || mod;

        // Merge user themeConfig into defaults
        // Support new format where user exports LitedocsConfig directly
        const userThemeConfig = userConfig.themeConfig || userConfig;

        return {
          docsDir: path.resolve(docsDir),
          themeConfig: {
            ...defaults.themeConfig,
            ...userThemeConfig,
          },
          i18n: userConfig.i18n,
          siteUrl: userConfig.siteUrl,
        };
      } catch (e) {
        console.warn(`[litedocs] Failed to load config from ${filename}:`, e);
      }
    }
  }

  return defaults;
}
