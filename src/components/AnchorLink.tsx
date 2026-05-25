"use client";

import { scrollToAnchor } from "@/lib/scrollAnchor";
import type { ReactNode } from "react";

interface AnchorLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export default function AnchorLink({
  href,
  className,
  children,
  onClick,
}: AnchorLinkProps) {
  if (!href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      className={className}
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
