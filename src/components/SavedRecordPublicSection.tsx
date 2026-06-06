"use client";

import Link from "next/link";
import { useState } from "react";
import {
  UNPUBLISH_CONFIRM_MESSAGE,
  unpublishStoredRecord,
} from "@/lib/unpublishReport";
import type { StoredRecord } from "@/types/analysis";

interface SavedRecordPublicSectionProps {
  record: StoredRecord;
}

export default function SavedRecordPublicSection({
  record,
}: SavedRecordPublicSectionProps) {
  const [unpublishing, setUnpublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!record.cloudReportId) return null;

  const handleUnpublish = async () => {
    if (!window.confirm(UNPUBLISH_CONFIRM_MESSAGE)) return;

    setUnpublishing(true);
    setError(null);
    try {
      const result = await unpublishStoredRecord(record);
      if (!result.ok) {
        setError(result.message);
      }
    } finally {
      setUnpublishing(false);
    }
  };

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6">
      <h2 className="text-sm font-bold text-emerald-900">已公开到案例池</h2>
      <p className="mt-2 text-xs leading-relaxed text-emerald-900/90">
        他人可在「公开」列表查看本条摘要与现场照片（位置已模糊）。
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/reports/${record.cloudReportId}`}
          className="btn-secondary inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          查看公开页
        </Link>
        <button
          type="button"
          disabled={unpublishing}
          onClick={() => void handleUnpublish()}
          className="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-50 disabled:opacity-50"
        >
          {unpublishing ? "正在撤回…" : "撤回公开"}
        </button>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-emerald-900/80">
        仅上传者可撤回；本机档案仍保留，可再次公开。
      </p>
      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
