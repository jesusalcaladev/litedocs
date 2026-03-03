import { Plugin } from 'vite';
import { litedocsPlugin } from './plugin';
import { litedocsMdxPlugin } from './mdx';
import { LitedocsPluginOptions } from './plugin';

export default function litedocs(options?: LitedocsPluginOptions): Plugin[] {
  return [
    ...litedocsPlugin(options),
    litedocsMdxPlugin()
  ];
}

export type { LitedocsPluginOptions };
export { generateStaticPages } from './ssg';
export type { SSGOptions } from './ssg';
export type { RouteMeta } from './routes';
export type { LitedocsConfig, LitedocsThemeConfig } from './config';
