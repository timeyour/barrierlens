"use client";

import Image from "next/image";
import Link from "next/link";
import PublicReportCard from "@/components/PublicReportCard";
import { HOME_SURFACE_CARD } from "@/config/homeLayout";
import {
  RECORD_MODES,
  SCENE_TYPE_LABELS,
  type RecordMode,
} from "@/types/analysis";
import type { CloudReportSummary } from "@/types/cloudReport";
import { displayLocationLabel } from "@/lib/locationValidation";
import type { NavLayout } from "@/config/navLayout";
import { navLayoutQuery } from "@/config/navLayout";
import { useEffect, useState } from "react";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "今天";
  if (days === 1) return "1 天前";
  if (days < 7) return `${days} 天前`;
  return new Date(iso).toLocaleDateString("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "short",
    day: "numeric",
  });
}

function reportsHref(layout: NavLayout): string {
  if (layout === "fixmystreet") return `/reports${navLayoutQuery("fixmystreet")}`;
  return "/reports";
}

function CompactReportRow({
  report,
  flow = false,
  withThumb = false,
}: {
  report: CloudReportSummary;
  flow?: boolean;
  withThumb?: boolean;
}) {
  const scene =
    SCENE_TYPE_LABELS[report.scene_type as keyof typeof SCENE_TYPE_LABELS] ??
    report.scene_type;

  return (
    <Link
      href={`/reports/${report.id}`}
      className={`flex gap-3 rounded-xl border px-3 py-2.5 transition ${
        flow
          ? "border-white/10 bg-white/[0.03] hover:border-sky-400/30 hover:bg-white/[0.06]"
          : "border-slate-200/90 bg-white hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm"
      }`}
    >
      {withThumb && (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {report.image_url ? (
            <Image
              src={report.image_url}
              alt=""
              fill
              className="object-cover object-center"
              sizes="56px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[9px] text-slate-400">
              无图
            </div>
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`line-clamp-1 text-xs font-semibold ${flow ? "text-white" : "text-slate-900"}`}>
          {report.issue_type}
        </p>
        <p className={`mt-0.5 line-clamp-1 text-[11px] ${flow ? "text-white/50" : "text-slate-600"}`}>
          {displayLocationLabel(report.location)}
        </p>
        <p className={`mt-1 text-[10px] ${flow ? "text-white/35" : "text-slate-500"}`}>
          {scene} · {formatRelativeTime(report.created_at)}
        </p>
      </div>
    </Link>
  );
}

interface HomeRecentReportsPanelProps {
  variant?: "section" | "sidebar" | "inline" | "strip";
  limit?: number;
  layout?: NavLayout;
  flow?: boolean;
}

export default function HomeRecentReportsPanel({
  variant = "section",
  limit = 5,
  layout = "mixed",
  flow = false,
}: HomeRecentReportsPanelProps) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [reports, setReports] = useState<CloudReportSummary[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/reports?limit=${limit}`)
      .then((res) => res.json())
      .then((data: { configured?: boolean; reports?: CloudReportSummary[] }) => {
        if (cancelled) return;
        setConfigured(data.configured !== false);
        setReports(Array.isArray(data.reports) ? data.reports.slice(0, limit) : []);
      })
      .catch(() => {
        if (cancelled) return;
        setConfigured(false);
        setReports([]);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  const isSidebar = variant === "sidebar";
  const isInline = variant === "inline";
  const isStrip = variant === "strip";
  const loading = configured === null;

  const inner = (
    <>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2
            className={
              flow
                ? isSidebar
                  ? "font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300/75"
                  : isInline
                    ? "text-xs font-bold text-white"
                    : "text-lg font-bold text-white"
                : isSidebar
                  ? "text-sm font-bold text-slate-900"
                  : isInline || isStrip
                    ? "text-sm font-bold text-slate-900"
                    : "text-lg font-bold text-slate-900"
            }
          >
            近期公开案例
          </h2>
          {(isSidebar || isInline || isStrip) && (
            <p
              className={`mt-1 text-[11px] leading-snug ${
                flow ? "text-white/45" : "text-slate-500"
              }`}
            >
              摘要公开 · 位置模糊 · 不含现场照片
            </p>
          )}
        </div>
        <Link
          href={reportsHref(layout)}
          className={`text-xs font-semibold ${
            flow ? "text-sky-300 hover:text-sky-200" : "text-blue-700 hover:text-blue-900"
          }`}
        >
          全部 →
        </Link>
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-200 bg-white/80 px-3 py-4 text-xs text-slate-500">
          加载公开案例…
        </div>
      )}

      {!loading && !configured && (
        <div
          className={
            flow
              ? "rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100"
              : "rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
          }
        >
          公开池未配置
        </div>
      )}

      {!loading && configured && reports.length === 0 && (
        <div
          className={
            flow
              ? "rounded-lg border border-dashed border-white/15 px-3 py-6 text-center text-xs text-white/40"
              : "rounded-lg border border-dashed border-slate-300 bg-white/80 px-3 py-6 text-center text-xs text-slate-600"
          }
        >
          暂无公开案例 · 生成报告后可选择公开摘要
        </div>
      )}

      {!loading && reports.length > 0 && (isSidebar || isInline || isStrip) && (
        <ul
          className={
            isInline || isStrip
              ? "-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
              : "space-y-2.5"
          }
        >
          {reports.map((report) => (
            <li
              key={report.id}
              className={isInline || isStrip ? "w-[min(82vw,280px)] shrink-0 sm:w-[260px]" : undefined}
            >
              <CompactReportRow report={report} flow={flow} withThumb={isSidebar || isStrip} />
            </li>
          ))}
        </ul>
      )}

      {!loading && reports.length > 0 && !isSidebar && !isInline && (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li key={report.id}>
              <PublicReportCard report={report} />
            </li>
          ))}
        </ul>
      )}
    </>
  );

  if (isInline || isStrip) {
    return (
      <div
        id="recent"
        className={`scroll-mt-24 ${HOME_SURFACE_CARD} px-4 py-4 sm:px-5 sm:py-5`}
      >
        {inner}
      </div>
    );
  }

  if (isSidebar) {
    return (
      <aside id="recent" className={`scroll-mt-24 ${HOME_SURFACE_CARD} p-4 sm:p-5`}>
        {inner}
      </aside>
    );
  }

  return (
    <section id="recent" className="scroll-mt-24 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">{inner}</div>
    </section>
  );
}
