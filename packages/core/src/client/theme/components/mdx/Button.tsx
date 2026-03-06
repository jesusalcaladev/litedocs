import React from "react";

export type ButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Visual variant */
    variant?: "primary" | "secondary" | "outline" | "ghost";
    /** Size */
    size?: "sm" | "md" | "lg";
    /** If provided, renders as a link */
    href?: string;
    children: React.ReactNode;
  };

/**
 * A versatile button/link component for use in MDX pages and the home page.
 *
 * ```mdx
 * <Button variant="primary" href="/docs/getting-started">Get Started →</Button>
 * <Button variant="secondary" href="https://github.com">GitHub</Button>
 * ```
 */
export function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const cls = `ld-btn ld-btn--${variant} ld-btn--${size} ${className}`.trim();

  if (href) {
    return (
      <a
        href={href}
        style={{ textDecoration: "none" }}
        className={cls}
        {...(rest as any)}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={cls} {...(rest as any)}>
      {children}
    </button>
  );
}
