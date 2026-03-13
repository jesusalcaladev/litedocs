import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "../Link";
import * as Icons from "lucide-react";

interface TabConfig {
  id: string;
  text: string;
  icon?: string;
}

interface TabsProps {
  tabs: TabConfig[];
  routes: any[];
}

export function Tabs({ tabs, routes }: TabsProps) {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({
    opacity: 0,
    transform: "translateX(0) scaleX(0)",
    width: 0,
  });

  const currentRoute = routes.find((r) => r.path === location.pathname);
  const currentTabId = currentRoute?.tab?.toLowerCase();

  // Find the active index - default to 0 if no tab detected
  const activeIndex = tabs.findIndex((tab) =>
    currentTabId ? currentTabId === tab.id.toLowerCase() : false
  );
  
  const finalActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  useEffect(() => {
    const activeTab = tabRefs.current[finalActiveIndex];
    if (activeTab) {
      setIndicatorStyle({
        opacity: 1,
        width: activeTab.offsetWidth,
        transform: `translateX(${activeTab.offsetLeft}px)`,
      });
    }
  }, [finalActiveIndex, tabs, location.pathname]);

  if (!tabs || tabs.length === 0) return null;

  const renderTabIcon = (iconName?: string) => {
    if (!iconName) return null;

    if (iconName.trim().startsWith("<svg")) {
      return (
        <span
          className="tab-icon svg-icon"
          dangerouslySetInnerHTML={{ __html: iconName }}
        />
      );
    }

    const LucideIcon = (Icons as any)[iconName];
    if (LucideIcon) {
      return <LucideIcon size={16} className="tab-icon lucide-icon" />;
    }

    return <img src={iconName} alt="" className="tab-icon img-icon" />;
  };

  return (
    <div className="boltdocs-tabs-container">
      <div className="boltdocs-tabs" ref={containerRef}>
        {tabs.map((tab, index) => {
          const isActive = index === finalActiveIndex;
          const firstRoute = routes.find(
            (r) => r.tab && r.tab.toLowerCase() === tab.id.toLowerCase()
          );
          const linkTo = firstRoute ? firstRoute.path : "#";

          return (
            <Link
              key={tab.id}
              to={linkTo}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              className={`boltdocs-tab-item ${isActive ? "active" : ""}`}
            >
              {renderTabIcon(tab.icon)}
              <span>{tab.text}</span>
            </Link>
          );
        })}
        {/* Sliding Indicator */}
        <div className="boltdocs-tab-indicator" style={indicatorStyle} />
      </div>
    </div>
  );
}
