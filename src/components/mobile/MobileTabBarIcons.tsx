import type { ReactNode } from "react";
import type { MobileTabMatch } from "@/config/mobileNav";

const ICON_CLASS = "h-[22px] w-[22px] shrink-0";

function SvgWrap({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={ICON_CLASS}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function MobileTabBarIcon({ match }: { match: MobileTabMatch }) {
  switch (match) {
    case "story":
      return (
        <SvgWrap>
          <path d="M5 7h14M5 12h10M5 17h6" />
        </SvgWrap>
      );
    case "tool":
      return (
        <SvgWrap>
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1.5" />
          <circle cx="12" cy="13" r="2.75" />
        </SvgWrap>
      );
    case "reports":
      return (
        <SvgWrap>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M2 12h20M12 3.5a13 13 0 0 1 0 17M12 3.5a13 13 0 0 0 0 17" />
        </SvgWrap>
      );
    case "tech":
      return (
        <SvgWrap>
          <path d="M8 9 4 12l4 3M16 9l4 3-4 3M14 5l-4 14" />
        </SvgWrap>
      );
    case "records":
      return (
        <SvgWrap>
          <circle cx="12" cy="8.5" r="3.25" />
          <path d="M6.5 19.5c.9-3 2.9-4.5 5.5-4.5s4.6 1.5 5.5 4.5" />
        </SvgWrap>
      );
    case "how":
      return (
        <SvgWrap>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 10.5v5M12 8v.5" />
        </SvgWrap>
      );
    default:
      return null;
  }
}
