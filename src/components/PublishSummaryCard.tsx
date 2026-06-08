"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { fuzzLocationForPublic } from "@/lib/locationValidation";

interface PublishSummaryCardProps {
  fuzzyLocationPreview: string;
  publishing: boolean;
  publishedId: string | null;
  publishError: string | null;
  onPublish: () => void | Promise<void>;
  unpublishing?: boolean;
  unpublishError?: string | null;
  onUnpublish?: () => void | Promise<void>;
  embedded?: boolean;
  /** 本机档案已写入时可公开 */
  archiveReady?: boolean;
}

export default function PublishSummaryCard({
  fuzzyLocationPreview,
  publishing,
  publishedId,
  publishError,
  onPublish,
  unpublishing = false,
  unpublishError = null,
  onUnpublish,
  embedded = false,
  archiveReady = true,
}: PublishSummaryCardProps) {
  const consentId = useId();
  const [consented, setConsented] = useState(false);
  const canPublish = archiveReady && consented && !publishing;

  if (publishedId) {
    return (
      <section className={embedded ? "space-y-3" : "rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5"}>
        <h3 className="text-sm font-bold text-emerald-900">已公开</h3>
        <p className="text-xs leading-relaxed text-emerald-900/90">
          公开位置：<strong>{fuzzyLocationPreview}</strong> · 含现场照片（位置已模糊）
        </p>
        <Link
          href={`/reports/${publishedId}`}
          className="btn-secondary mt-4 inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          查看公开页
        </Link>
        {onUnpublish && (
          <div className="mt-3 space-y-2">
            <button
              type="button"
              disabled={unpublishing}
              onClick={() => void onUnpublish()}
              className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-50 disabled:opacity-50"
            >
              {unpublishing ? "正在撤回…" : "撤回公开"}
            </button>
            <p className="text-[11px] leading-relaxed text-emerald-900/80">
              仅本人可撤回；本机档案仍保留，可再次公开。
            </p>
            {unpublishError && (
              <p className="text-xs text-red-600" role="alert">
                {unpublishError}
              </p>
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      className={`relative z-10 ${embedded ? "space-y-3" : "rounded-2xl border border-slate-200 bg-white p-5"}`}
    >
      {!embedded && (
        <h3 className="text-sm font-bold text-slate-900">可选 · 公开到案例池</h3>
      )}
      <p className="text-xs leading-relaxed text-slate-600">
        默认仅存本机。勾选并确认后，他人可在「公开」列表查看本条；位置显示为{" "}
        <strong>{fuzzyLocationPreview}</strong>，并展示现场照片。
      </p>

      {!archiveReady && (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="alert">
          本机档案未保存，暂无法公开。请查看上方存储提示，或重新分析后再试。
        </p>
      )}

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
        <div className="flex items-start gap-3">
          <input
            id={consentId}
            type="checkbox"
            checked={consented}
            disabled={!archiveReady}
            onChange={(event) => setConsented(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
          />
          <label
            htmlFor={consentId}
            className={`min-w-0 flex-1 text-xs leading-relaxed ${
              archiveReady ? "cursor-pointer text-slate-700" : "cursor-not-allowed text-slate-400"
            }`}
          >
            我确认公开本条记录（含现场照片，位置模糊）
          </label>
        </div>
        <button
          type="button"
          disabled={!archiveReady}
          onClick={() => setConsented((value) => !value)}
          className="mt-2 text-[11px] font-semibold text-blue-700 hover:text-blue-900 disabled:text-slate-400"
        >
          {consented ? "取消勾选" : "点此处勾选确认"}
        </button>
      </div>

      <button
        type="button"
        disabled={!canPublish}
        onClick={() => void onPublish()}
        aria-label="公开案例"
        className="btn-primary mt-3 rounded-lg px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {publishing ? "正在公开…" : "确认公开"}
      </button>

      {publishError && (
        <p className="mt-3 text-xs text-red-600" role="alert">
          {publishError}
        </p>
      )}
    </section>
  );
}

export function previewFuzzyLocation(exact: string | undefined | null): string {
  return fuzzLocationForPublic(exact);
}
