import React, { useState, useRef, useEffect } from "react";
import { Copy, ChevronDown, Check, ExternalLink } from "lucide-react";
import "./copy-markdown.css";

export interface CopyMarkdownProps {
  content?: string;
  config?: boolean | { text?: string; icon?: string };
}

export function CopyMarkdown({ content, config }: CopyMarkdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isEnabled = config !== false;
  const buttonText = typeof config === "object" ? config.text || "Copy Markdown" : "Copy Markdown";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isEnabled || !content) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setIsOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenRaw = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setIsOpen(false);
  };

  return (
    <div className="boltdocs-copy-markdown" ref={dropdownRef}>
      <div className="copy-btn-group">
        <button
          className="copy-btn"
          onClick={handleCopy}
          aria-label="Copy Markdown"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span className="copy-label">{copied ? "Copied!" : buttonText}</span>
        </button>
        <button
          className={`copy-dropdown-toggle ${isOpen ? "is-active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="More options"
          aria-expanded={isOpen}
        >
          <ChevronDown size={14} className="arrow-icon" />
        </button>
      </div>

      {isOpen && (
        <div className="copy-dropdown">
          <button className="copy-option" onClick={handleCopy}>
            <Copy size={14} />
            Copy Markdown
          </button>
          <button className="copy-option" onClick={handleOpenRaw}>
            <ExternalLink size={14} />
            View as Markdown
          </button>
        </div>
      )}
    </div>
  );
}
