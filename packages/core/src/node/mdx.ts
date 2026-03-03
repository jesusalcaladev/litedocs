import mdxPlugin from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import type { Plugin } from "vite";

/**
 * Configures the MDX compiler for Vite using `@mdx-js/rollup`.
 * Includes standard remark and rehype plugins for GitHub Flavored Markdown (GFM),
 * frontmatter extraction, auto-linking headers, and syntax highlighting via `rehype-pretty-code`.
 *
 * @returns A Vite plugin configured for MDX parsing
 */
export function litedocsMdxPlugin(): Plugin {
  return mdxPlugin({
    remarkPlugins: [remarkGfm, remarkFrontmatter],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            className: ["header-anchor"],
            ariaHidden: true,
            tabIndex: -1,
          },
          content: {
            type: "element",
            tagName: "span",
            properties: { className: ["anchor-icon"] },
            children: [{ type: "text", value: "#" }],
          },
        },
      ],
      [
        rehypePrettyCode,
        {
          theme: "one-dark-pro",
          keepBackground: false,
        },
      ],
    ],
    // Provide React as default for JSX
    jsxRuntime: "automatic",
    providerImportSource: "@mdx-js/react",
  }) as Plugin;
}
