import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "./Link";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { usePreload } from "../app/preload";
import { LitedocsConfig } from "../../node/config";
import { ComponentRoute } from "../app";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { OnThisPage } from "./OnThisPage";
import { Head } from "./Head";
import { Breadcrumbs } from "./Breadcrumbs";
import { BackgroundGradient } from "./BackgroundGradient";
import "./styles.css";

export interface ThemeLayoutProps {
  config: LitedocsConfig;
  routes: ComponentRoute[];
  children: React.ReactNode;
}

/**
 * The main structural layout for documentation pages.
 * Integrates the Navbar, Sidebar, and OnThisPage components into a cohesive shell.
 * It also manages mobile interaction states like the sidebar overlay toggle.
 *
 * @param config - The global Litedocs configuration object
 * @param routes - The array of available doc routes (used to render the sidebar)
 */
export function ThemeLayout({ config, routes, children }: ThemeLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const siteTitle = config.themeConfig?.title || "Litedocs";
  const siteDescription = config.themeConfig?.description || "";
  const location = useLocation();

  // Compute prev/next pages and locale
  const currentIndex = routes.findIndex((r) => r.path === location.pathname);
  const currentRoute = routes[currentIndex];
  // Determine current locale (fallback to default)
  const currentLocale = config.i18n
    ? currentRoute?.locale || config.i18n.defaultLocale
    : undefined;

  // Filter routes for sidebar, search, and navigation to only ones in the current locale
  const localizedRoutes = config.i18n
    ? routes.filter(
        (r) => (r.locale || config.i18n!.defaultLocale) === currentLocale,
      )
    : routes;

  const localIndex = localizedRoutes.findIndex(
    (r) => r.path === location.pathname,
  );
  const prevPage = localIndex > 0 ? localizedRoutes[localIndex - 1] : null;
  const nextPage =
    localIndex >= 0 && localIndex < localizedRoutes.length - 1
      ? localizedRoutes[localIndex + 1]
      : null;

  const { preload } = usePreload();
  React.useEffect(() => {
    if (prevPage?.path) preload(prevPage.path);
    if (nextPage?.path) preload(nextPage.path);
  }, [prevPage, nextPage, preload]);

  return (
    <div className="litedocs-layout">
      <BackgroundGradient />
      <Head
        siteTitle={siteTitle}
        siteDescription={siteDescription}
        routes={routes}
      />
      <Navbar
        config={config}
        routes={localizedRoutes}
        allRoutes={routes}
        currentLocale={currentLocale}
      />
      <div
        className={`litedocs-main-container ${!isSidebarOpen ? "sidebar-collapsed" : ""}`}
      >
        <Sidebar
          routes={localizedRoutes}
          config={config}
          onCollapse={() => setIsSidebarOpen(false)}
        />

        {/* Floating Expand Button when Sidebar is Collapsed */}
        <button
          className="sidebar-toggle-floating"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Expand Sidebar"
          title="Expand Sidebar"
        >
          <Menu size={20} />
        </button>

        <main className="litedocs-content">
          <Breadcrumbs routes={localizedRoutes} config={config} />
          <div className="litedocs-page">{children}</div>

          {/* Prev / Next Navigation */}
          {(prevPage || nextPage) && (
            <nav className="page-nav">
              {prevPage ? (
                <Link
                  to={prevPage.path || "/"}
                  className="page-nav-link page-nav-link--prev"
                >
                  <div className="page-nav-info">
                    <span className="page-nav-label">Previous</span>
                    <span className="page-nav-title">{prevPage.title}</span>
                  </div>
                  <ChevronLeft className="page-nav-arrow" size={16} />
                </Link>
              ) : (
                <span />
              )}
              {nextPage ? (
                <Link
                  to={nextPage.path || "/"}
                  className="page-nav-link page-nav-link--next"
                >
                  <div className="page-nav-info">
                    <span className="page-nav-label">Next</span>
                    <span className="page-nav-title">{nextPage.title}</span>
                  </div>
                  <ChevronRight className="page-nav-arrow" size={16} />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </main>
        <OnThisPage
          headings={routes[currentIndex]?.headings}
          editLink={config.themeConfig?.editLink}
          communityHelp={config.themeConfig?.communityHelp}
          filePath={routes[currentIndex]?.filePath}
        />
      </div>
    </div>
  );
}
