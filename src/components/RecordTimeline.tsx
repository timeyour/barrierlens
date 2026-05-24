"use client";

import { formatRecordTime, getRecords, seedDemoRecordsIfEmpty } from "@/lib/recordStore";
import { RECORD_MODES } from "@/types/analysis";
import type { StoredRecord } from "@/types/analysis";
import SectionHeader from "@/components/SectionHeader";
import ScrollReveal from "@/components/ScrollReveal";
import { useEffect, useState } from "react";

function RecordItem({
  record,
  className = "",
}: {
  record: StoredRecord;
  className?: string;
}) {
  const modeLabel = RECORD_MODES[record.recordMode].label;
  const preview =
    record.recordMode === "inspection"
      ? record.inspectionText || record.reportText
      : record.advocacyText || record.reportText;

  return (
    <li className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
            record.recordMode === "public"
              ? "bg-blue-100 text-blue-800"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {modeLabel}
        </span>
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
            record.riskLevel === "高"
              ? "bg-red-100 text-red-800"
              : record.riskLevel === "中"
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-700"
          }`}
        >
          {record.riskLevel}风险
        </span>
        <span className="text-[11px] text-slate-400">
          {formatRecordTime(record.recordedAt)}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">
        {record.issueType} · {record.location || "地点未标注"}
      </p>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
        {record.sceneDescription}
      </p>
      {preview && (
        <p className="mt-2 line-clamp-2 text-[11px] text-slate-400">
          {preview.slice(0, 120)}…
        </p>
      )}
    </li>
  );
}

export default function RecordTimeline() {
  const [records, setRecords] = useState<StoredRecord[]>([]);

  useEffect(() => {
    seedDemoRecordsIfEmpty();
    setRecords(getRecords());

    const onStorage = () => setRecords(getRecords());
    window.addEventListener("storage", onStorage);
    window.addEventListener("barrierlens-record-saved", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("barrierlens-record-saved", onStorage);
    };
  }, []);

  return (
    <ScrollReveal>
      <section id="records" className="mb-6 scroll-mt-28 md:mb-10 lg:mb-14">
        <SectionHeader
          eyebrow="Records"
          title="问题记录时间线"
          description="单次反馈可能被忽略，但每一条被归档的记录，都在帮助问题被看见、被汇总。"
          align="center"
          descriptionClassName="hidden md:block"
        />
        <ul className="space-y-3">
          {records.map((record, index) => (
            <RecordItem
              key={record.id}
              record={record}
              className={index > 0 ? "hidden md:block" : ""}
            />
          ))}
        </ul>
        {records.length > 1 && (
          <p className="mt-3 text-center text-[11px] text-slate-400 md:hidden">
            还有 {records.length - 1} 条记录，在电脑端可查看完整时间线
          </p>
        )}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          记录保存在本机浏览器，演示数据可在首次访问时自动加载
        </p>
      </section>
    </ScrollReveal>
  );
}
