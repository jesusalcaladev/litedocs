import React, { useState } from "react";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { Copy, Check, Terminal, Play } from "lucide-react";

interface PlaygroundProps {
  code?: string;
  children?: string | React.ReactNode;
  scope?: Record<string, any>;
  readonly?: boolean;
  noInline?: boolean;
}

/**
 * Transforms code that uses `export default` into a format compatible
 * with react-live's `noInline` mode by stripping the export and
 * appending a `render(<ComponentName />)` call.
 */
function prepareCode(raw: string): { code: string; noInline: boolean } {
  const trimmed = raw.trim();

  // Match: export default function Name(...)
  const fnMatch = trimmed.match(/export\s+default\s+function\s+(\w+)/);
  if (fnMatch) {
    const name = fnMatch[1];
    const code =
      trimmed.replace(/export\s+default\s+/, "") + `\n\nrender(<${name} />);`;
    return { code, noInline: true };
  }

  // Match: export default ComponentName  (at the end)
  const varMatch = trimmed.match(/export\s+default\s+(\w+)\s*;?\s*$/);
  if (varMatch) {
    const name = varMatch[1];
    const code =
      trimmed.replace(/export\s+default\s+\w+\s*;?\s*$/, "") +
      `\nrender(<${name} />);`;
    return { code, noInline: true };
  }

  // No export default — use inline mode (simple JSX expression)
  return { code: trimmed, noInline: false };
}

/**
 * A live React playground component.
 * Features a split layout with a live editor and a preview section.
 *
 * Supports `export default function App()` style code out of the box.
 */
export function Playground({
  code,
  children,
  scope = {},
  readonly = false,
  noInline: forceNoInline,
}: PlaygroundProps) {
  // Extract code from either `code` prop or `children`
  let initialCode = code || "";
  if (!initialCode && typeof children === "string") {
    initialCode = children;
  }

  const prepared = prepareCode(initialCode);
  const useNoInline = forceNoInline ?? prepared.noInline;

  const [copied, setCopied] = useState(false);
  const [activeCode, setActiveCode] = useState(prepared.code);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Provide React generically
  const extendedScope = { React, ...scope };

  return (
    <div className="boltdocs-playground" data-readonly={readonly}>
      <LiveProvider
        code={activeCode}
        scope={extendedScope}
        theme={undefined}
        noInline={useNoInline}
      >
        <div className="playground-split-container">
          {/* Editor Side */}
          <div className="playground-panel playground-editor-panel">
            <div className="playground-panel-header">
              <div className="playground-panel-title">
                <Terminal size={14} />
                <span>{readonly ? "Code Example" : "Live Editor"}</span>
              </div>
              <button
                className="playground-copy-btn"
                onClick={handleCopy}
                title="Copy code"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="playground-panel-content playground-editor">
              <LiveEditor disabled={readonly} onChange={setActiveCode} />
            </div>
          </div>

          {/* Preview Side */}
          <div className="playground-panel playground-preview-panel">
            <div className="playground-panel-header">
              <div className="playground-panel-title">
                <Play size={14} />
                <span>Preview</span>
              </div>
            </div>
            <div className="playground-panel-content playground-preview">
              <LivePreview />
              <LiveError className="playground-error" />
            </div>
          </div>
        </div>
      </LiveProvider>
    </div>
  );
}
