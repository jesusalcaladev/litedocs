import fs from "fs";
import path from "path";
import { generateRoutes } from "./routes";
import { LitedocsConfig } from "./config";
import { escapeHtml } from "./utils";
import { fileURLToPath } from "url";
import { createRequire } from "module";

// Polyfill __dirname and require for ESM
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const _require = createRequire(import.meta.url);

/**
 * Options for the Static Site Generation process.
 */
export interface SSGOptions {
  /** The root directory containing markdown documentation files */
  docsDir: string;
  /** The output directory where Vite placed the compiled `index.html` and assets */
  outDir: string;
  /** Pre-resolved config (avoids re-resolving during the SSG phase) */
  config?: LitedocsConfig;
}

/**
 * Generates static HTML files and a `sitemap.xml` for all documentation routes.
 * Called automatically in the `closeBundle` hook of the Vite plugin during a production build.
 *
 * @param options - Configuration for paths and site metadata
 */
export async function generateStaticPages(options: SSGOptions): Promise<void> {
  const { docsDir, outDir, config } = options;
  const routes = await generateRoutes(docsDir, config);
  const siteTitle = config?.themeConfig?.title || "Litedocs";
  const siteDescription = config?.themeConfig?.description || "";

  // Resolve the SSR module (compiled by tsup)
  const ssrModulePath = path.resolve(_dirname, "../client/ssr.js");
  if (!fs.existsSync(ssrModulePath)) {
    console.error(
      "[litedocs] SSR module not found at",
      ssrModulePath,
      "- Did you build the core package?",
    );
    return;
  }
  const { render } = _require(ssrModulePath);

  // Read the built index.html as template
  const templatePath = path.join(outDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.warn("[litedocs] No index.html found in outDir, skipping SSG.");
    return;
  }
  const template = fs.readFileSync(templatePath, "utf-8");

  // Load user's homePage if configured
  let homePageComp;
  if ((config as any)?._homePagePath) {
    try {
      // Simplistic: if there's a custom home page compiled, we'd need it available to SSR.
      // In a full framework this is complex, but for Litedocs we assume it's bundled if needed.
    } catch (e) {}
  }

  // Generate an HTML file for each route
  for (const route of routes) {
    const pageTitle = `${route.title} | ${siteTitle}`;
    const pageDescription = route.description || siteDescription;

    // We mock the modules for SSR so it doesn't crash trying to dynamically import
    const fakeModules: Record<string, any> = {};
    fakeModules[route.componentPath] = { default: () => {} }; // Mock MDX component

    try {
      const appHtml = await render({
        path: route.path,
        routes: routes,
        config: config || {},
        modules: fakeModules,
        homePage: homePageComp,
      });

      const html = replaceMetaTags(template, {
        title: escapeHtml(pageTitle),
        description: escapeHtml(pageDescription),
      })
        .replace("<!--app-html-->", appHtml)
        .replace(`<div id="root"></div>`, `<div id="root">${appHtml}</div>`);

      const routeDir = path.join(outDir, route.path);
      fs.mkdirSync(routeDir, { recursive: true });
      fs.writeFileSync(path.join(routeDir, "index.html"), html, "utf-8");
    } catch (e) {
      console.error(`[litedocs] Error SSR rendering route ${route.path}:`, e);
    }
  }

  // Generate sitemap.xml
  const sitemap = generateSitemap(
    routes.map((r) => r.path),
    config,
  );
  fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap, "utf-8");

  console.log(
    `[litedocs] Generated ${routes.length} static pages + sitemap.xml`,
  );
}

// ─── Helpers ─────────────────────────────────────────────

/**
 * Replaces placeholder or default meta tags in the HTML template with page-specific values.
 *
 * @param html - The base HTML template string
 * @param meta - An object containing the derived `title` and `description` for the specific page
 * @returns The final HTML string for that specific page
 */
function replaceMetaTags(
  html: string,
  meta: { title: string; description: string },
): string {
  return html
    .replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${meta.description}$2`,
    )
    .replace(
      /(<meta property="og:title" content=")[^"]*(")/,
      `$1${meta.title}$2`,
    )
    .replace(
      /(<meta property="og:description" content=")[^"]*(")/,
      `$1${meta.description}$2`,
    )
    .replace(
      /(<meta name="twitter:title" content=")[^"]*(")/,
      `$1${meta.title}$2`,
    )
    .replace(
      /(<meta name="twitter:description" content=")[^"]*(")/,
      `$1${meta.description}$2`,
    );
}

/**
 * Generates a standard XML sitemap for search engine crawlers.
 *
 * @param routePaths - An array of existing URL paths (e.g., ['/docs/intro', '/docs/setup'])
 * @param config - The Litedocs configuration containing i18n and siteUrl settings
 * @returns The formatted XML sitemap string
 */
function generateSitemap(
  routePaths: string[],
  config?: LitedocsConfig,
): string {
  const baseUrl = config?.siteUrl?.replace(/\/$/, "") || "https://example.com";
  const today = new Date().toISOString().split("T")[0];

  const rootEntries = [{ url: "/", priority: "1.0", changefreq: "daily" }];

  if (config?.i18n) {
    const defaultLocale = config.i18n.defaultLocale;
    for (const locale of Object.keys(config.i18n.locales)) {
      if (locale !== defaultLocale) {
        rootEntries.push({
          url: `/${locale}/`,
          priority: "1.0",
          changefreq: "daily",
        });
      }
    }
  }

  const entries = [
    ...rootEntries,
    ...routePaths.map((p) => ({
      url: p,
      priority: "0.8",
      changefreq: "weekly",
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${baseUrl}${e.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;
}
