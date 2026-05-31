"use client";

import { useState } from "react";

interface PhotoAccessRequestFormProps {
  reportId: string;
}

export default function PhotoAccessRequestForm({
  reportId,
}: PhotoAccessRequestFormProps) {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setFeedback(null);
    try {
      const response = await fetch(`/api/reports/${reportId}/photo-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, contact }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setError(data.error ?? "提交失败");
        return;
      }
      setFeedback(data.message ?? "已登记申请");
      setMessage("");
      setContact("");
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h2 className="text-sm font-semibold text-slate-900">申请复核查看现场照片</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        公开页不含现场照片。若需核对与摘要是否一致，可向记录者提交申请；是否提供由记录者在本机档案中决定。
      </p>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="说明申请原因，例如：公益组织复核、物业跟进需对照现场"
        rows={3}
        className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400"
      />
      <input
        value={contact}
        onChange={(event) => setContact(event.target.value)}
        placeholder="你的联系方式（选填，便于记录者回复）"
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400"
      />

      <button
        type="button"
        disabled={submitting || message.trim().length < 4}
        onClick={() => void handleSubmit()}
        className="btn-primary mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {submitting ? "提交中…" : "提交复核申请"}
      </button>

      {feedback && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {feedback}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
