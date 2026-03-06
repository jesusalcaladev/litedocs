import React, { useEffect, useState } from "react";
import { Link } from "../Link";
import { Book, ChevronDown } from "lucide-react";
import { LitedocsConfig } from "../../../../node/config";
import { ComponentRoute } from "../../../app";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { VersionSwitcher } from "../VersionSwitcher";
import { ThemeToggle } from "../ThemeToggle";
import { getStarsRepo } from "../../../utils";
import { Discord } from "../../icons/discord";
import { XformerlyTwitter } from "../../icons/twitter";
import { GithubStars } from "./GithubStars";

const SearchDialog = React.lazy(() =>
  import("../SearchDialog").then((m) => ({ default: m.SearchDialog })),
);

const ICON_MAP: Record<string, React.FC> = {
  discord: Discord,
  x: XformerlyTwitter,
};

function formatStars(stars: number) {
  if (stars >= 1000) {
    return (stars / 1000).toFixed(1) + "K";
  }
  return stars.toString();
}

/**
 * The top navigation bar of the documentation site.
 */
export function Navbar({
  config,
  routes,
  allRoutes,
  currentLocale,
  currentVersion,
}: {
  config: LitedocsConfig;
  routes?: ComponentRoute[];
  allRoutes?: ComponentRoute[];
  currentLocale?: string;
  currentVersion?: string;
}) {
  const [stars, setStars] = useState<string | null>(null);

  const title = config.themeConfig?.title || "Litedocs";
  const navItems = config.themeConfig?.navbar || [];
  const socialLinks = config.themeConfig?.socialLinks || [];

  // Fetch Github Stars if repo is provided
  useEffect(() => {
    if (config.themeConfig?.githubRepo) {
      // Small dummy fetch simulation logic (real logic can be plugged here to `api.github.com/repos/...`)
      // We will set a static value for testing if it fails, normally we fetch Github API.
      getStarsRepo(config.themeConfig.githubRepo)
        .then((stars) => setStars(stars))
        .catch(() => setStars("0"));
    }
  }, [config.themeConfig?.githubRepo]);

  return (
    <header className="litedocs-navbar">
      <div className="navbar-container">
        {/* LEFT SECTION */}
        <div className="navbar-left">
          <div className="navbar-logo">
            <Link to="/">
              {config.themeConfig?.logo ? (
                config.themeConfig.logo.trim().startsWith("<svg") ? (
                  <span
                    className="navbar-logo-svg"
                    dangerouslySetInnerHTML={{
                      __html: config.themeConfig.logo,
                    }}
                  />
                ) : (
                  <img
                    src={config.themeConfig.logo}
                    alt={title}
                    className="navbar-logo-img"
                  />
                )
              ) : (
                <Book width="20" height="20" />
              )}
              {title}
            </Link>
          </div>

          {config.versions && currentVersion && allRoutes ? (
            <VersionSwitcher
              versions={config.versions}
              currentVersion={currentVersion}
              currentLocale={currentLocale}
              allRoutes={allRoutes}
            />
          ) : config.themeConfig?.version ? (
            <div className="navbar-version">
              {config.themeConfig.version} <ChevronDown size={14} />
            </div>
          ) : null}

          <nav className="navbar-links" aria-label="Top Navigation">
            {navItems.map((item, i) => (
              <Link key={i} to={item.link}>
                {item.text}
              </Link>
            ))}
          </nav>
        </div>

        {/* RIGHT SECTION */}
        <div className="navbar-right">
          <React.Suspense
            fallback={<div className="navbar-search-placeholder" />}
          >
            <SearchDialog routes={routes || []} />
          </React.Suspense>

          {config.i18n && currentLocale && allRoutes && (
            <LanguageSwitcher
              i18n={config.i18n}
              currentLocale={currentLocale}
              allRoutes={allRoutes}
            />
          )}

          <ThemeToggle />

          {config.themeConfig?.githubRepo && (
            <GithubStars repo={config.themeConfig.githubRepo} />
          )}

          {/* Optional Divider if both groups have items */}
          {socialLinks.length > 0 && <div className="navbar-divider" />}

          <div className="navbar-icons">
            {socialLinks.map((link, i) => {
              const IconComp = ICON_MAP[link.icon.toLowerCase()];
              return (
                <a
                  key={i}
                  href={link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navbar-icon-btn"
                  aria-label={link.icon}
                >
                  {IconComp ? <IconComp /> : <span>{link.icon}</span>}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
