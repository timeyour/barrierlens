"use client";

import { useCallback, useEffect, useState } from "react";
import type { PhotoAccessRequest } from "@/types/cloudReport";
import type { StoredRecord } from "@/types/analysis";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PhotoAccessRequestsPanelProps {
  record: StoredRecord;
}

export default function PhotoAccessRequestsPanel({
  record,
}: PhotoAccessRequestsPanelProps) {
  const [requests, setRequests] = useState<PhotoAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!record.cloudReportId || !record.reviewToken) {
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        localId: record.id,
        reviewToken: record.reviewToken,
      });
      const response = await fetch(
        `/api/reports/${record.cloudReportId}/photo-requests?${params.toString()}`,
      );
      const data = (await response.json()) as {
        requests?: PhotoAccessRequest[];
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "无法加载复核申请");
        setRequests([]);
        return;
      }
      setRequests(data.requests ?? []);
    } catch {
      setError("网络错误");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [record.cloudReportId, record.id, record.reviewToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const markContacted = async (requestId: string) => {
    if (!record.cloudReportId || !record.reviewToken) return;
    await fetch(`/api/reports/${record.cloudReportId}/photo-requests`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId,
        localId: record.id,
        reviewToken: record.reviewToken,
        status: "contacted",
      }),
    });
    void load();
  };

  if (!record.cloudReportId) return null;

  return (
    <section className="rounded-2xl border border-violet-200 bg-violet-50/50 p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-violet-950">照片复核申请</h2>
      <p className="mt-2 text-xs leading-relaxed text-violet-900/80">
        公开页不展示现场照片。以下为他人提交的查看申请——请自行判断是否提供本页照片或 PDF。
      </p>

      {loading && <p className="mt-4 text-xs text-violet-800/70">加载中…</p>}
      {error && (
        <p className="mt-4 text-xs text-red-700" role="alert">
          {error}
          {!record.reviewToken &&
            " · 此记录在升级公开流程前发布，无法拉取申请。"}
        </p>
      )}

      {!loading && !error && requests.length === 0 && (
        <p className="mt-4 rounded-lg bg-white/80 px-3 py-3 text-xs text-slate-600">
          暂无复核申请
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {requests.map((request) => (
          <li
            key={request.id}
            className="rounded-xl border border-violet-100 bg-white px-4 py-3"
          >
            <p className="text-sm text-slate-800">{request.message}</p>
            {request.contact && (
              <p className="mt-1 text-xs text-slate-600">联系：{request.contact}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-500">
                {formatTime(request.created_at)}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                  request.status === "contacted"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {request.status === "contacted" ? "已联系" : "待处理"}
              </span>
              {request.status === "pending" && record.reviewToken && (
                <button
                  type="button"
                  onClick={() => void markContacted(request.id)}
                  className="rounded-md border border-violet-200 px-2 py-1 text-[11px] font-semibold text-violet-800"
                >
                  标记已联系
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
