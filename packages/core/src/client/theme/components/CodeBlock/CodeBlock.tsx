import React, { useState, useRef, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "../../../utils";

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * A specialized wrapper for code snippets compiled from MDX blocks.
 * Provides syntax highlighting styling scaffolding and a "Copy to Clipboard" button.
 */
export function CodeBlock({ children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  // Extract language from the child <code> element's data-language or className
  let language = "";
  if (React.isValidElement(children)) {
    const childProps = children.props as any;
    language = childProps?.["data-language"] || "";
    if (!language && childProps?.className) {
      const match = childProps.className.match(/language-(\w+)/);
      if (match) language = match[1];
    }
  }

  const handleCopy = useCallback(async () => {
    const code = preRef.current?.textContent || "";
    copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="code-block-wrapper">
      <button
        className={`code-block-copy ${copied ? "copied" : ""}`}
        onClick={handleCopy}
        aria-label="Copy code"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
    </div>
  );
}
