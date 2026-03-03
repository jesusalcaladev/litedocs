import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "./Link";
import { Search } from "lucide-react";
import { ComponentRoute } from "../app";

interface SearchResult {
  title: string;
  path: string;
  groupTitle?: string;
  isHeading?: boolean;
}

export function SearchDialog({ routes }: { routes: ComponentRoute[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const searchResults: SearchResult[] = React.useMemo(() => {
    if (!query) {
      return routes.slice(0, 10).map((r) => ({
        title: r.title,
        path: r.path,
        groupTitle: r.groupTitle,
      }));
    }

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    for (const route of routes) {
      if (route.title && route.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          title: route.title,
          path: route.path,
          groupTitle: route.groupTitle,
        });
      }

      if (route.headings) {
        for (const heading of route.headings) {
          if (heading.text.toLowerCase().includes(lowerQuery)) {
            results.push({
              title: heading.text,
              path: `${route.path}#${heading.id}`,
              groupTitle: route.title,
              isHeading: true,
            });
          }
        }
      }
    }

    // Deduplicate results by path
    const uniqueResults = [];
    const seenPaths = new Set();
    for (const res of results) {
      if (!seenPaths.has(res.path)) {
        seenPaths.add(res.path);
        uniqueResults.push(res);
      }
    }

    return uniqueResults.slice(0, 10);
  }, [routes, query]);

  return (
    <>
      <div
        className="navbar-search"
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
      >
        <Search className="litedocs-search-icon" size={18} />
        Search docs...
        <kbd>⌘K</kbd>
      </div>

      {isOpen &&
        createPortal(
          <div
            className="litedocs-search-overlay"
            onPointerDown={() => setIsOpen(false)}
          >
            <div
              className="litedocs-search-modal"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="litedocs-search-header">
                <Search size={18} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search documentation..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  className="litedocs-search-close"
                  onClick={() => setIsOpen(false)}
                >
                  ESC
                </button>
              </div>

              <div className="litedocs-search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <Link
                      key={result.path}
                      to={result.path === "" ? "/" : result.path}
                      className={`litedocs-search-result-item ${result.isHeading ? "is-heading" : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="litedocs-search-result-title">
                        {result.isHeading ? (
                          <span className="heading-indicator">#</span>
                        ) : null}
                        {result.title}
                      </span>
                      {result.groupTitle && (
                        <span className="litedocs-search-result-group">
                          {result.groupTitle}
                        </span>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="litedocs-search-empty">
                    No results found for "{query}"
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
