"use client";

import Link from "next/link";
import { useState } from "react";
import { fuzzLocationForPublic } from "@/lib/locationValidation";

interface PublishSummaryCardProps {
  fuzzyLocationPreview: string;
  publishing: boolean;
  publishedId: string | null;
  publishError: string | null;
  onPublish: () => void | Promise<void>;
  embedded?: boolean;
}

export default function PublishSummaryCard({
  fuzzyLocationPreview,
  publishing,
  publishedId,
  publishError,
  onPublish,
  embedded = false,
}: PublishSummaryCardProps) {
  const [consented, setConsented] = useState(false);

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
      </section>
    );
  }

  return (
    <section className={embedded ? "space-y-3" : "rounded-2xl border border-slate-200 bg-white p-5"}>
      {!embedded && (
        <h3 className="text-sm font-bold text-slate-900">可选 · 公开到案例池</h3>
      )}
      <p className="text-xs leading-relaxed text-slate-600">
        默认仅存本机。勾选并确认后，他人可在「公开」列表查看本条；位置显示为{" "}
        <strong>{fuzzyLocationPreview}</strong>，并展示现场照片。
      </p>

      <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
        <input
          type="checkbox"
          checked={consented}
          onChange={(event) => setConsented(event.target.checked)}
          className="mt-0.5"
        />
        <span className="text-xs leading-relaxed text-slate-700">
          我确认公开本条记录（含现场照片，位置模糊）
        </span>
      </label>

      <button
        type="button"
        disabled={!consented || publishing}
        onClick={() => void onPublish()}
        aria-label="公开案例"
        className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
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
