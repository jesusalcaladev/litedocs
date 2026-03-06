import React from "react";
import { useLocation } from "react-router-dom";
import { Link } from "../Link";
import { Home, ChevronRight } from "lucide-react";
import { ComponentRoute } from "../../../app";
import { LitedocsConfig } from "../../../../node/config";

export interface BreadcrumbsProps {
  routes: ComponentRoute[];
  config: LitedocsConfig;
}

export function Breadcrumbs({ routes, config }: BreadcrumbsProps) {
  const location = useLocation();

  if (config.themeConfig?.breadcrumbs === false) return null;
  if (location.pathname === "/") return null;

  const currentRoute = routes.find((r) => r.path === location.pathname);

  const groupRoute = currentRoute?.group
    ? routes.find((r) => r.group === currentRoute.group)
    : null;

  return (
    <nav className="litedocs-breadcrumbs" aria-label="Breadcrumb">
      <ol className="litedocs-breadcrumbs-list">
        <li className="litedocs-breadcrumbs-item">
          <Link to="/" className="litedocs-breadcrumbs-link">
            {/* Home Icon */}
            <Home size={14} />
          </Link>
          <span className="litedocs-breadcrumbs-separator">
            <ChevronRight size={14} />
          </span>
        </li>

        {currentRoute?.groupTitle && (
          <li className="litedocs-breadcrumbs-item">
            {groupRoute ? (
              <Link to={groupRoute.path} className="litedocs-breadcrumbs-link">
                {currentRoute.groupTitle}
              </Link>
            ) : (
              <span className="litedocs-breadcrumbs-text">
                {currentRoute.groupTitle}
              </span>
            )}
            <span className="litedocs-breadcrumbs-separator">
              <ChevronRight size={14} />
            </span>
          </li>
        )}

        {currentRoute?.title && (
          <li className="litedocs-breadcrumbs-item">
            <span
              className="litedocs-breadcrumbs-text litedocs-breadcrumbs-active"
              aria-current="page"
            >
              {currentRoute.title}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}
