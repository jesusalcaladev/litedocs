import { Plugin, ResolvedConfig, loadEnv } from "vite";
import { generateRoutes, invalidateRouteCache, invalidateFile } from "./routes";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { resolveConfig, LitedocsConfig, CONFIG_FILES } from "./config";
import { generateStaticPages } from "./ssg";
import { normalizePath, isDocFile } from "./utils";
import path from "path";

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

/**
 * The core Litedocs Vite plugin.
 * Handles virtual module resolution, HMR for documentation files,
 * injecting HTML meta tags for SEO, and triggering the SSG process on build.
 *
 * @param options - Optional configuration for the plugin
 * @returns An array of Vite plugins
 */
export function litedocsPlugin(options: LitedocsPluginOptions = {}): Plugin[] {
  const docsDir = path.resolve(process.cwd(), options.docsDir || "docs");
  const normalizedDocsDir = normalizePath(docsDir);
  let config: LitedocsConfig;
  let viteConfig: ResolvedConfig;
  let isBuild = false;

  return [
    {
      name: "vite-plugin-litedocs",
      enforce: "pre",

      async config(userConfig, env) {
        isBuild = env.command === "build";

        // Load env variables and inject into process.env so they are available in litedocs.config.js
        const envDir = userConfig.envDir || process.cwd();
        const envs = loadEnv(env.mode, envDir, "");
        Object.assign(process.env, envs);

        // Resolve config async (loads litedocs.config.js if present)
        config = await resolveConfig(docsDir);

        // If customCss specified in user's config file, use it
        if (!options.customCss && config.themeConfig?.customCss) {
          options.customCss = config.themeConfig.customCss;
        }

        return {
          optimizeDeps: { include: ["react", "react-dom"] },
        };
      },

      configResolved(resolved) {
        viteConfig = resolved;
      },

      configureServer(server) {
        // Explicitly watch config files to trigger server restarts
        const configPaths = CONFIG_FILES.map((c) =>
          path.resolve(process.cwd(), c),
        );
        server.watcher.add(configPaths);

        const handleFileEvent = async (
          file: string,
          type: "add" | "unlink" | "change",
        ) => {
          const normalized = normalizePath(file);

          // Restart the Vite server if the Litedocs config changes
          if (CONFIG_FILES.some((c) => normalized.endsWith(c))) {
            server.restart();
            return;
          }

          if (
            !normalized.startsWith(normalizedDocsDir) ||
            !isDocFile(normalized)
          )
            return;

          // Invalidate appropriately
          if (type === "add" || type === "unlink") {
            invalidateRouteCache();
          } else {
            invalidateFile(file);
          }

          // Regenerate and push to client
          const newRoutes = await generateRoutes(docsDir, config);

          const routesMod = server.moduleGraph.getModuleById(
            "\0virtual:litedocs-routes",
          );
          if (routesMod) server.moduleGraph.invalidateModule(routesMod);

          server.ws.send({
            type: "custom",
            event: "litedocs:routes-update",
            data: newRoutes,
          });
        };

        server.watcher.on("add", (f) => handleFileEvent(f, "add"));
        server.watcher.on("unlink", (f) => handleFileEvent(f, "unlink"));
        server.watcher.on("change", (f) => handleFileEvent(f, "change"));
      },

      resolveId(id) {
        if (
          id === "virtual:litedocs-routes" ||
          id === "virtual:litedocs-config" ||
          id === "virtual:litedocs-entry"
        ) {
          return "\0" + id;
        }
      },

      async load(id) {
        if (id === "\0virtual:litedocs-routes") {
          const routes = await generateRoutes(docsDir, config);
          return `export default ${JSON.stringify(routes, null, 2)};`;
        }
        if (id === "\0virtual:litedocs-config") {
          return `export default ${JSON.stringify(config, null, 2)};`;
        }
        if (id === "\0virtual:litedocs-entry") {
          return generateEntryCode(options);
        }
      },

      transformIndexHtml: {
        order: "pre",
        handler(html) {
          return injectHtmlMeta(html, config);
        },
      },

      async closeBundle() {
        if (!isBuild) return;
        const outDir = viteConfig?.build?.outDir
          ? path.resolve(viteConfig.root, viteConfig.build.outDir)
          : path.resolve(process.cwd(), "dist");

        await generateStaticPages({ docsDir, outDir, config });
      },
    },
    ViteImageOptimizer({
      includePublic: true,
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 80 },
      svg: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: { overrides: { removeViewBox: false } },
          },
        ] as any,
      },
    }),
  ];
}

// ─── Helpers ─────────────────────────────────────────────

/**
 * Generates the raw source code for the virtual entry file (`\0virtual:litedocs-entry`).
 * This code initializes the client-side React application.
 *
 * @param options - Plugin options containing potential custom overrides (like `homePage` or `customCss`)
 * @returns A string of JavaScript code to be evaluated by the browser
 */
function generateEntryCode(options: LitedocsPluginOptions): string {
  const homeImport = options.homePage
    ? `import HomePage from '${options.homePage}';`
    : "";
  const homeOption = options.homePage ? "homePage: HomePage," : "";
  const customCssImport = options.customCss
    ? `import '${options.customCss}';`
    : "";

  return `
import { createLitedocsApp } from 'litedocs/client';
import 'litedocs/style.css';
${customCssImport}
import routes from 'virtual:litedocs-routes';
import config from 'virtual:litedocs-config';
${homeImport}

createLitedocsApp({
  target: '#root',
  routes,
  config,
  modules: import.meta.glob('/docs/**/*.{md,mdx}'),
  hot: import.meta.hot,
  ${homeOption}
});
`;
}

/**
 * Injects OpenGraph, Twitter, and generic SEO meta tags into the final HTML output.
 * Also ensures the virtual entry file is injected if it's missing (e.g., standard Vite index.html).
 *
 * @param html - The original HTML string
 * @param config - The resolved Litedocs configuration containing site metadata
 * @returns The modified HTML string with injected tags
 */
function injectHtmlMeta(html: string, config: LitedocsConfig): string {
  const title = config.themeConfig?.title || "Litedocs";
  const description = config.themeConfig?.description || "";

  const seoTags = [
    `<meta name="description" content="${description}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:type" content="website">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="generator" content="Litedocs">`,
  ].join("\n    ");

  const themeScript = `
    <script>
      (function() {
        try {
          var stored = localStorage.getItem("litedocs-theme");
          var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
          if (theme === "light") {
            document.documentElement.classList.add("theme-light");
            document.documentElement.dataset.theme = "light";
          } else {
            document.documentElement.classList.remove("theme-light");
            document.documentElement.dataset.theme = "dark";
          }
        } catch (e) {}
      })();
    </script>
  `;

  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  html = html.replace("</head>", `    ${seoTags}\n${themeScript}  </head>`);

  if (!html.includes("src/main")) {
    html = html.replace(
      "</body>",
      '  <script type="module">import "virtual:litedocs-entry";</script>\n  </body>',
    );
  }

  return html;
}
