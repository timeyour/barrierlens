"use client";

import Link from "next/link";
import PublicReportCard from "@/components/PublicReportCard";
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
}: {
  report: CloudReportSummary;
  flow?: boolean;
}) {
  const recordMode = report.record_mode as RecordMode;
  const scene =
    SCENE_TYPE_LABELS[report.scene_type as keyof typeof SCENE_TYPE_LABELS] ??
    report.scene_type;

  return (
    <Link
      href={`/reports/${report.id}`}
      className={`block rounded-lg border px-3 py-2.5 transition ${
        flow
          ? "border-white/10 bg-white/[0.03] hover:border-sky-400/30 hover:bg-white/[0.06]"
          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
      }`}
    >
      <p className={`line-clamp-1 text-xs font-semibold ${flow ? "text-white" : "text-slate-900"}`}>
        {report.issue_type}
      </p>
      <p className={`mt-0.5 line-clamp-1 text-[11px] ${flow ? "text-white/50" : "text-slate-600"}`}>
        {displayLocationLabel(report.location)}
      </p>
      <p className={`mt-1 text-[10px] ${flow ? "text-white/35" : "text-slate-500"}`}>
        {scene} · {RECORD_MODES[recordMode]?.label ?? recordMode} ·{" "}
        {formatRelativeTime(report.created_at)}上报
      </p>
    </Link>
  );
}

interface HomeRecentReportsPanelProps {
  variant?: "section" | "sidebar" | "inline";
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
                  : isInline
                    ? "text-xs font-bold text-slate-900"
                    : "text-lg font-bold text-slate-900"
            }
          >
            近期公开案例
          </h2>
          {(isSidebar || isInline) && (
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

      {!loading && reports.length > 0 && (isSidebar || isInline) && (
        <ul className={isInline ? "flex gap-2 overflow-x-auto pb-1" : "space-y-2"}>
          {reports.map((report) => (
            <li key={report.id} className={isInline ? "min-w-[220px] shrink-0" : undefined}>
              <CompactReportRow report={report} flow={flow} />
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

  if (isInline) {
    return (
      <div
        id="recent"
        className={
          flow
            ? "scroll-mt-24 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3"
            : "scroll-mt-24 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-3"
        }
      >
        {inner}
      </div>
    );
  }

  if (isSidebar) {
    return (
      <aside
        id="recent"
        className={
          flow
            ? "scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            : "scroll-mt-24 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
        }
      >
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
