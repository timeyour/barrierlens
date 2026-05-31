interface PublicReportReadOnlyBannerProps {
  enabled?: boolean;
}

export default function PublicReportReadOnlyBanner({
  enabled = true,
}: PublicReportReadOnlyBannerProps) {
  if (!enabled) return null;

  return (
    <div
      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600"
      role="note"
    >
      只读摘要 · 位置已模糊 · 不含现场照片 · 不代表已受理或结案
    </div>
  );
}
