"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  hackathonFlagsRollbackHint,
  hackathonLegacyQuery,
  resolveHackathonFlagsFromSearch,
} from "@/config/hackathonFlags";

export default function HackathonFlagsPreviewBanner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    search[key] = value;
  });

  const flags = resolveHackathonFlagsFromSearch(search);
  const activeHint = hackathonFlagsRollbackHint(flags);
  const isLegacy = search.legacy === "1";

  if (!activeHint && !isLegacy) return null;

  const legacyHref = `${pathname}${hackathonLegacyQuery()}`;

  return (
    <div
      className={`relative z-40 border-b px-4 py-2 text-center text-xs leading-relaxed ${
        isLegacy
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : "border-violet-200 bg-violet-50 text-violet-950"
      }`}
      role="status"
    >
      {isLegacy ? (
        <p>
          已启用<strong className="font-semibold">旧行为模式</strong>
          （路名可选、无公开页只读声明等）。
          <Link href={pathname} className="ml-2 font-semibold underline">
            恢复新特性
          </Link>
        </p>
      ) : (
        <p>
          大赛新特性已开启：{activeHint}。
          <Link href={legacyHref} className="ml-2 font-semibold underline">
            一键退回旧行为（?legacy=1）
          </Link>
          <span className="mx-2 hidden sm:inline">·</span>
          <span className="mt-1 block sm:mt-0 sm:inline">
            单项关闭示例：
            <code className="mx-1 rounded bg-white/70 px-1">?locationRequired=0</code>
          </span>
        </p>
      )}
    </div>
  );
}
