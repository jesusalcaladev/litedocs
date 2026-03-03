import React from "react";
import { Link } from "./Link";

export function NotFound() {
  return (
    <div className="litedocs-not-found">
      <div className="not-found-content">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-text">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="not-found-link">
          ← Go to Home
        </Link>
      </div>
    </div>
  );
}
