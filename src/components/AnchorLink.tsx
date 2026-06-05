"use client";

import { scrollToAnchor } from "@/lib/scrollAnchor";
import type { ReactNode } from "react";

interface AnchorLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
}

export default function AnchorLink({
  href,
  className,
  children,
  onClick,
  "aria-label": ariaLabel,
}: AnchorLinkProps) {
  if (!href.startsWith("#")) {
    return (
      <a href={href} className={className} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={(event) => {
        event.preventDefault();
        scrollToAnchor(href);
        window.history.pushState(null, "", href);
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
