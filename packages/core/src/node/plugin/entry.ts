import { normalizePath } from "../utils";
import type { LitedocsConfig } from "../config";
import type { LitedocsPluginOptions } from "./types";

/**
 * Generates the raw source code for the virtual entry file (`\0virtual:litedocs-entry`).
 * This code initializes the client-side React application.
 *
 * @param options - Plugin options containing potential custom overrides (like `homePage` or `customCss`)
 * @param config - The resolved Litedocs configuration containing custom plugins and components
 * @returns A string of JavaScript code to be evaluated by the browser
 */
export function generateEntryCode(
  options: LitedocsPluginOptions,
  config?: LitedocsConfig,
): string {
  const homeImport = options.homePage
    ? `import HomePage from '${normalizePath(options.homePage)}';`
    : "";
  const homeOption = options.homePage ? "homePage: HomePage," : "";
  const customCssImport = options.customCss
    ? `import '${normalizePath(options.customCss)}';`
    : "";

  const pluginComponents =
    config?.plugins?.flatMap((p) => Object.entries(p.components || {})) || [];

  const componentImports = pluginComponents
    .map(
      ([
        name,
        path,
      ]) => `import * as _comp_${name} from '${normalizePath(path)}';
const ${name} = _comp_${name}.default || _comp_${name}['${name}'] || _comp_${name};`,
    )
    .join("\n");
  const componentMap = pluginComponents.map(([name]) => name).join(", ");

  return `
import { createLitedocsApp as _createApp } from 'litedocs/client';
import 'litedocs/style.css';
${customCssImport}
import _routes from 'virtual:litedocs-routes';
import _config from 'virtual:litedocs-config';
${homeImport}
${componentImports}

_createApp({
  target: '#root',
  routes: _routes,
  config: _config,
  modules: import.meta.glob('/docs/**/*.{md,mdx}'),
  hot: import.meta.hot,
  ${homeOption}
  components: { ${componentMap} },
});
`;
}
