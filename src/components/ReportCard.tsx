interface ReportCardProps {
  reportText: string;
}

export default function ReportCard({ reportText }: ReportCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
      <h3 className="text-sm font-semibold text-emerald-900">
        标准化反馈文本
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
        {reportText}
      </p>
    </div>
  );
}
