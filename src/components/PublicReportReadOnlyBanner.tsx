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
      只读快照，不代表已受理或结案
    </div>
  );
}
