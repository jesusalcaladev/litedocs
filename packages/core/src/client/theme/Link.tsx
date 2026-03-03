import React from "react";
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  LinkProps as RouterLinkProps,
  NavLinkProps as RouterNavLinkProps,
  useLocation,
} from "react-router-dom";
import { usePreload } from "../app/preload";
import { useConfig } from "../app";

function useLocalizedTo(to: RouterLinkProps["to"]) {
  const location = useLocation();
  const config = useConfig();
  if (!config || !config.i18n || typeof to !== "string") return to;

  const basePath = "/docs";
  if (!to.startsWith(basePath)) return to;

  let currentLocale = config.i18n.defaultLocale;
  const locales = Object.keys(config.i18n.locales);

  for (const loc of locales) {
    if (
      location.pathname.startsWith(`${basePath}/${loc}/`) ||
      location.pathname === `${basePath}/${loc}`
    ) {
      currentLocale = loc;
      break;
    }
  }

  const targetSubPath = to.substring(basePath.length);
  let hasLocale = false;
  for (const loc of locales) {
    if (targetSubPath.startsWith(`/${loc}/`) || targetSubPath === `/${loc}`) {
      hasLocale = true;
      break;
    }
  }

  if (!hasLocale) {
    if (targetSubPath === "" || targetSubPath === "/") {
      return `${basePath}/${currentLocale}`;
    } else {
      return `${basePath}/${currentLocale}${targetSubPath}`;
    }
  }

  return to;
}

export interface LinkProps extends Omit<RouterLinkProps, "prefetch"> {
  /** Should prefetch the page on hover? Options: 'hover' | 'none'. Default 'hover' */
  litedocsPrefetch?: "hover" | "none";
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    const {
      litedocsPrefetch = "hover",
      onMouseEnter,
      onFocus,
      to,
      ...rest
    } = props;
    const localizedTo = useLocalizedTo(to);
    const { preload } = usePreload();

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onMouseEnter?.(e);
      if (
        litedocsPrefetch === "hover" &&
        typeof localizedTo === "string" &&
        localizedTo.startsWith("/")
      ) {
        preload(localizedTo);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
      onFocus?.(e);
      if (
        litedocsPrefetch === "hover" &&
        typeof localizedTo === "string" &&
        localizedTo.startsWith("/")
      ) {
        preload(localizedTo);
      }
    };

    return (
      <RouterLink
        ref={ref}
        to={localizedTo}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        {...rest}
      />
    );
  },
);
Link.displayName = "Link";

export interface NavLinkProps extends Omit<RouterNavLinkProps, "prefetch"> {
  /** Should prefetch the page on hover? Options: 'hover' | 'none'. Default 'hover' */
  litedocsPrefetch?: "hover" | "none";
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  (props, ref) => {
    const {
      litedocsPrefetch = "hover",
      onMouseEnter,
      onFocus,
      to,
      ...rest
    } = props;

    const localizedTo = useLocalizedTo(to);
    const { preload } = usePreload();

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onMouseEnter?.(e);
      if (
        litedocsPrefetch === "hover" &&
        typeof localizedTo === "string" &&
        localizedTo.startsWith("/")
      ) {
        preload(localizedTo);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
      onFocus?.(e);
      if (
        litedocsPrefetch === "hover" &&
        typeof localizedTo === "string" &&
        localizedTo.startsWith("/")
      ) {
        preload(localizedTo);
      }
    };

    return (
      <RouterNavLink
        ref={ref}
        to={localizedTo}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        {...rest}
      />
    );
  },
);
NavLink.displayName = "NavLink";
