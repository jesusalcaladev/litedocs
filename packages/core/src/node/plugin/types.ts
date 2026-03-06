/**
 * Configuration options specifically for the Litedocs Vite plugin.
 */
export interface LitedocsPluginOptions {
  /** The root directory containing markdown files (default: 'docs') */
  docsDir?: string;
  /** Path to a custom home page component (relative to project root) to render at '/' */
  homePage?: string;
  /** Path to a custom CSS file to override theme variables. Can also be set in litedocs.config.js */
  customCss?: string;
}
