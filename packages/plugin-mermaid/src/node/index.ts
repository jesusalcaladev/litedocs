import { visit } from "unist-util-visit";

/**
 * A tiny rehype plugin that detects `<code className="language-mermaid">` blocks
 * and transforms them into `<Mermaid chart="{raw_code}" />` JSX elements before
 * `rehype-pretty-code` attempts to highlight them.
 */
export function rehypeMermaid() {
  return (tree: any) => {
    visit(
      tree,
      "element",
      (node: any, index: number | undefined, parent: any) => {
        if (typeof index !== "number" || !parent) return;
        if (node.tagName === "pre" && node.children?.length === 1) {
          const codeNode = node.children[0];
          if (
            codeNode.tagName === "code" &&
            codeNode.properties?.className?.includes("language-mermaid")
          ) {
            const rawCode = codeNode.children[0]?.value || "";

            // Replace the <pre> node with our custom <Mermaid> React component
            parent.children[index] = {
              type: "mdxJsxFlowElement",
              name: "Mermaid",
              attributes: [
                {
                  type: "mdxJsxAttribute",
                  name: "chart",
                  value: rawCode,
                },
              ],
              children: [],
            };
          }
        }
      },
    );
  };
}
