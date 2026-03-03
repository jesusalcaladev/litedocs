import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Pencil, CircleHelp } from "lucide-react";

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function OnThisPage({
  headings = [],
  editLink,
  communityHelp,
  filePath,
}: {
  headings?: TocHeading[];
  editLink?: string;
  communityHelp?: string;
  filePath?: string;
}) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const location = useLocation();

  // Reset active ID when path changes
  useEffect(() => {
    setActiveId(headings.length > 0 ? headings[0].id : "");
  }, [location.pathname, headings]);

  // IntersectionObserver for active heading tracking
  useEffect(() => {
    if (headings.length === 0) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const callback: IntersectionObserverCallback = (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length > 0) {
        setActiveId(visible[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: "-80px 0px -60% 0px",
      threshold: 0,
    });

    let retryCount = 0;
    const maxRetries = 20; // Try for 2 seconds (20 * 100ms)

    const observeHeadings = () => {
      let allFound = true;
      headings.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) {
          observerRef.current!.observe(el);
        } else {
          allFound = false;
        }
      });

      if (!allFound && retryCount < maxRetries) {
        retryCount++;
        setTimeout(observeHeadings, 100);
      }
    };

    // Start looking for headings
    observeHeadings();

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveId(id);
        window.history.replaceState(null, "", `#${id}`);
      }
    },
    [],
  );

  if (headings.length === 0) return null;

  return (
    <div className="litedocs-on-this-page">
      <p className="on-this-page-title">On this page</p>
      <ul className="on-this-page-list">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "toc-indent" : ""}>
            <a
              href={`#${h.id}`}
              className={`toc-link ${activeId === h.id ? "active" : ""}`}
              onClick={(e) => handleClick(e, h.id)}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>

      {/* Need help? section */}
      {(editLink || communityHelp) && (
        <div className="toc-help">
          <p className="toc-help-title">Need help?</p>
          <ul className="toc-help-links">
            {editLink && filePath && (
              <li>
                <a
                  href={editLink.replace(":path", filePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="toc-help-link"
                >
                  <Pencil size={16} />
                  Edit this page
                </a>
              </li>
            )}
            {communityHelp && (
              <li>
                <a
                  href={communityHelp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="toc-help-link"
                >
                  <CircleHelp size={16} />
                  Community help
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
