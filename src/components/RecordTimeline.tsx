"use client";

import Link from "next/link";
import {
  clearAllRecords,
  formatRecordTime,
  getRecords,
  purgeDemoLedgerRecords,
  purgeDemoRecords,
  seedDemoLedgerRecords,
  updateRecordReview,
} from "@/lib/recordStore";
import { fileToStoredImageDataUrl, isAcceptableImageFile } from "@/lib/imageUtils";
import {
  REVIEW_STATUS_LABELS,
  type ReviewStatus,
} from "@/types/analysis";
import { displayLocationLabel } from "@/lib/locationValidation";
import type { StoredRecord } from "@/types/analysis";
import BarrierMap from "@/components/BarrierMap";
import PhotoCompareSlider from "@/components/PhotoCompareSlider";
import RecordEvidencePreview from "@/components/RecordEvidencePreview";
import RecordTimelineFilters from "@/components/RecordTimelineFilters";
import ReviewStatusFlow from "@/components/ReviewStatusFlow";
import LedgerReportPreview from "@/components/LedgerReportPreview";
import ProductMethodologyNotice from "@/components/ProductMethodologyNotice";
import ScrollReveal from "@/components/ScrollReveal";
import HomeFlowSection from "@/components/HomeFlowSection";
import SectionHeader from "@/components/SectionHeader";
import SpatialDiagnosisTags from "@/components/SpatialDiagnosisTags";
import { REVIEW_STATUS_BADGE, REVIEW_STATUS_BAR } from "@/lib/reviewStatusStyles";
import { buildLedgerReport } from "@/lib/ledgerReport";
import {
  countByLedgerStatus,
  formatLedgerDisplayId,
  LEDGER_STATUS_FLOW,
} from "@/lib/ledgerStatus";
import {
  countByQueue,
  DEFAULT_RECORD_FILTERS,
  filterRecords,
  groupRecordsByLocation,
  type RecordFilterState,
} from "@/lib/recordFilters";
import { useEffect, useRef, useState } from "react";

const REVIEW_FLOW = LEDGER_STATUS_FLOW;

const EMPTY_RECORDS: StoredRecord[] = [];

function ReviewPhotoCompare({
  record,
  onUploadClick,
  onClear,
  uploading,
}: {
  record: StoredRecord;
  onUploadClick: () => void;
  onClear: () => void;
  uploading: boolean;
}) {
  const hasBefore = Boolean(record.imageDataUrl);
  const hasAfter = Boolean(record.reviewImageDataUrl);

  return (
    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
      <p className="text-[11px] font-semibold text-emerald-900">整改反馈照片（复拍）</p>

      {hasBefore && hasAfter ? (
        <>
          <p className="mt-1 text-[11px] text-emerald-800/90">
            拖动对比反馈时与整改后现场变化。
          </p>
          <div className="mt-3">
            <PhotoCompareSlider
              beforeUrl={record.imageDataUrl!}
              afterUrl={record.reviewImageDataUrl!}
              beforeLabel="反馈时"
              afterLabel="整改后"
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={onUploadClick}
                className="rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-800"
              >
                更换整改照片
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={onClear}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600"
              >
                删除整改照片
              </button>
            </div>
          </div>
        </>
      ) : hasBefore ? (
        <>
          <p className="mt-1 text-[11px] text-emerald-800/90">
            已保存反馈照片，请上传整改后复拍以完成前后对比。
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={record.imageDataUrl}
            alt="反馈时现场照片"
            className="mt-3 aspect-[4/3] w-full rounded-lg border border-slate-200 object-cover"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={onUploadClick}
            className="mt-3 flex w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-emerald-400 bg-white px-4 py-4 text-center transition hover:border-emerald-500 hover:bg-emerald-50/80 disabled:opacity-60"
          >
            <span className="text-xs font-semibold text-emerald-800">
              {uploading ? "正在保存…" : "上传整改反馈照片"}
            </span>
          </button>
        </>
      ) : hasAfter ? (
        <>
          <p className="mt-1 text-[11px] text-amber-800">
            已有整改照片，但缺少最初反馈照片。请先在上方工具区上传并分析归档。
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={record.reviewImageDataUrl}
            alt="整改后复拍照片"
            className="mt-3 aspect-[4/3] w-full rounded-lg border border-emerald-300 object-cover"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={onUploadClick}
              className="rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-800"
            >
              更换
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={onClear}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600"
            >
              删除
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-1 text-[11px] text-emerald-800/90">
            请先在上方工具区上传并分析，再在此处上传整改复拍。
          </p>
          <button
            type="button"
            disabled={uploading}
            onClick={onUploadClick}
            className="mt-3 flex w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-emerald-400 bg-white px-4 py-6 text-center transition hover:border-emerald-500 hover:bg-emerald-50/80 disabled:opacity-60"
          >
            <span className="text-xs font-semibold text-emerald-800">
              {uploading ? "正在保存…" : "上传整改反馈照片"}
            </span>
          </button>
        </>
      )}
    </div>
  );
}

function RecordItem({
  record,
  flow = false,
  displayIndex = 0,
}: {
  record: StoredRecord;
  flow?: boolean;
  displayIndex?: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nextStatus, setNextStatus] = useState<ReviewStatus>(record.reviewStatus);
  const [reviewNote, setReviewNote] = useState(record.reviewNote ?? "");
  const [showMap, setShowMap] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const preview =
    record.recordMode === "inspection"
      ? record.inspectionText || record.reportText
      : record.advocacyText || record.reportText;

  const applyReviewUpdate = () => {
    if (nextStatus === record.reviewStatus && reviewNote.trim() === (record.reviewNote ?? "")) {
      return;
    }
    const previous = record.reviewStatus;
    updateRecordReview(record.id, {
      reviewStatus: nextStatus,
      reviewNote: reviewNote.trim() || undefined,
    });
    if (previous !== nextStatus) {
      setStatusNotice(
        `${REVIEW_STATUS_LABELS[previous]} → ${REVIEW_STATUS_LABELS[nextStatus]}`,
      );
      window.setTimeout(() => setStatusNotice(null), 3200);
    }
  };

  const handleReviewPhotoSelect = async (file: File | undefined) => {
    if (!file || !isAcceptableImageFile(file)) return;
    setUploading(true);
    try {
      const reviewImageDataUrl = await fileToStoredImageDataUrl(file);
      updateRecordReview(record.id, { reviewImageDataUrl });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearReviewPhoto = () => {
    updateRecordReview(record.id, { reviewImageDataUrl: null });
  };

  return (
    <li
      data-record-item=""
      className={
        flow
          ? "flex overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-none"
          : "flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      }
    >
      <div
        className={`w-1.5 shrink-0 ${REVIEW_STATUS_BAR[record.reviewStatus]}`}
        aria-hidden
      />
      <details className="group min-w-0 flex-1">
        <summary className="cursor-pointer list-none p-4 [&::-webkit-details-marker]:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold text-slate-400">
              {formatLedgerDisplayId(record, displayIndex)}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${REVIEW_STATUS_BADGE[record.reviewStatus]}`}
            >
              {REVIEW_STATUS_LABELS[record.reviewStatus]}
            </span>
            <SpatialDiagnosisTags record={record} compact />
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                record.riskLevel === "高"
                  ? "bg-red-100 text-red-800"
                  : record.riskLevel === "中"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
              }`}
            >
              {record.riskLevel}
            </span>
            <span className="ml-auto text-[11px] text-slate-400">
              {formatRecordTime(record.recordedAt)}
            </span>
          </div>
          <p className={`mt-2 text-sm font-semibold ${flow ? "text-white" : "text-slate-900"}`}>
            {record.issueType}
          </p>
          <p className={`mt-0.5 line-clamp-1 text-xs ${flow ? "text-white/50" : "text-slate-500"}`}>
            {displayLocationLabel(record.location)} · {record.problemSummary}
          </p>
          <p
            className={`mt-2 text-xs font-medium group-open:hidden ${
              flow ? "text-sky-300" : "text-blue-600"
            }`}
          >
            展开 ↓
          </p>
        </summary>

        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
          <Link
            href={`/saved/${record.id}`}
            className={`mb-3 inline-block text-xs font-semibold ${
              flow ? "text-emerald-300 hover:text-emerald-200" : "text-emerald-700 hover:text-emerald-800"
            }`}
          >
            查看详情 →
          </Link>
          <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-slate-700">AI 描述：</span>
              {record.problemSummary}
            </p>
            <p>
              <span className="font-semibold text-slate-700">整改建议：</span>
              {record.suggestion}
            </p>
            {record.reviewNote && (
              <p className="sm:col-span-2">
                <span className="font-semibold text-slate-700">复查结果：</span>
                {record.reviewNote}
              </p>
            )}
          </div>
          {!record.imageDataUrl && (
            <div className="mt-3 flex aspect-[4/3] max-w-xs items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 text-[11px] text-slate-500">
              演示数据 · 无现场图片
            </div>
          )}
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{record.sceneDescription}</p>
          {preview && (
            <p className="mt-2 line-clamp-3 text-[11px] text-slate-400">{preview.slice(0, 200)}…</p>
          )}

          <RecordEvidencePreview record={record} reviewStatus={record.reviewStatus} />

          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold text-slate-600">整改复查</p>
            <ReviewStatusFlow status={record.reviewStatus} />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => {
                void handleReviewPhotoSelect(event.target.files?.[0]);
              }}
            />

            <ReviewPhotoCompare
              record={record}
              uploading={uploading}
              onUploadClick={() => fileInputRef.current?.click()}
              onClear={clearReviewPhoto}
            />

            <button
              type="button"
              onClick={() => setShowMap((open) => !open)}
              className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
            >
              {showMap ? "收起整改地图" : "查看整改前后地图"}
            </button>
            {showMap && (
              <div className="mt-3 border-t border-slate-200 pt-3">
                <BarrierMap result={record} />
              </div>
            )}

            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="mb-2 text-[11px] font-semibold text-slate-600">更新状态</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value as ReviewStatus)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
                >
                  {REVIEW_FLOW.map((status) => (
                    <option key={status} value={status}>
                      {REVIEW_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                <input
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  placeholder="复查结果 / 备注"
                  className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={applyReviewUpdate}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  保存状态
                </button>
              </div>
              {statusNotice && (
                <p className="mt-2 rounded-md bg-blue-50 px-2 py-1.5 text-[11px] font-semibold text-blue-800">
                  状态已更新：{statusNotice}
                </p>
              )}
            </div>

            {record.reviewedAt && (
              <p className="mt-2 text-[11px] text-slate-500">
                最近复查：{formatRecordTime(record.reviewedAt)}
              </p>
            )}
          </div>
        </div>
      </details>
    </li>
  );
}

export default function RecordTimeline({ variant = "default" }: { variant?: "default" | "flow" }) {
  const flow = variant === "flow";
  const [records, setRecords] = useState<StoredRecord[]>(EMPTY_RECORDS);
  const [filters, setFilters] = useState<RecordFilterState>(DEFAULT_RECORD_FILTERS);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    purgeDemoRecords();
    const sync = () => setRecords(getRecords());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("barrierlens-record-saved", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("barrierlens-record-saved", sync);
    };
  }, []);

  const counts = countByQueue(records);
  const statusCounts = countByLedgerStatus(records);
  const visibleRecords = filterRecords(records, filters);
  const grouped = groupRecordsByLocation(visibleRecords);
  const reportData = buildLedgerReport(visibleRecords);

  const toolbar = (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <button
        type="button"
        onClick={() => {
          const added = seedDemoLedgerRecords();
          setRecords(getRecords());
          if (added > 0) {
            window.alert(`已加载 ${added} 条演示台账数据。`);
          } else {
            window.alert("演示台账已存在，无需重复加载。");
          }
        }}
        className={
          flow
            ? "flow-btn-secondary rounded-lg px-3 py-2 text-xs font-semibold"
            : "rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800"
        }
      >
        加载演示样例（10 条）
      </button>
      <button
        type="button"
        disabled={visibleRecords.length === 0}
        onClick={() => setReportOpen(true)}
        className={
          flow
            ? "rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900 disabled:opacity-40"
            : "rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
        }
      >
        生成巡检报告
      </button>
      <button
        type="button"
        onClick={() => {
          const removed = purgeDemoLedgerRecords();
          if (removed > 0) setRecords(getRecords());
        }}
        className="text-[11px] font-medium text-slate-500 underline underline-offset-2"
      >
        清除演示台账
      </button>
    </div>
  );

  const content = (
    <>
      <ProductMethodologyNotice compact />
      {toolbar}
      <RecordTimelineFilters
        filters={filters}
        onChange={setFilters}
        counts={counts}
        statusCounts={statusCounts}
        flow={flow}
      />

      {visibleRecords.length === 0 ? (
        <p
          className={
            flow
              ? "rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-white/45"
              : "rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500"
          }
        >
          没有匹配记录
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ location, records: groupRecords }) => (
            <div key={location}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className={`text-sm font-semibold ${flow ? "text-white/85" : "text-slate-800"}`}>
                  {location}
                </h3>
                <span className={`text-[11px] ${flow ? "text-white/35" : "text-slate-400"}`}>
                  {groupRecords.length} 条
                </span>
              </div>
              <ul className="space-y-3">
                {groupRecords.map((record, index) => (
                  <RecordItem
                    key={`${record.id}-${record.reviewStatus}-${record.reviewNote ?? ""}`}
                    record={record}
                    flow={flow}
                    displayIndex={index}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {reportOpen && (
        <LedgerReportPreview
          report={reportData}
          onClose={() => setReportOpen(false)}
        />
      )}

      {flow && records.length > 0 && (
        <p className="mt-4 text-center">
          <button
            type="button"
            className="text-[11px] font-medium text-white/35 underline decoration-white/20 underline-offset-2 hover:text-red-300"
            onClick={() => {
              if (window.confirm("清空本机全部记录？")) {
                clearAllRecords();
                setRecords([]);
              }
            }}
          >
            清空本机记录
          </button>
        </p>
      )}
    </>
  );

  if (flow) {
    return (
      <ScrollReveal>
        <HomeFlowSection
          id="records"
          index="03 · 时间线"
          title="证据时间线"
          hint="状态跟踪 · 报告导出"
          className="mb-6 md:mb-10 lg:mb-14"
        >
          {content}
        </HomeFlowSection>
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal>
      <section id="records" className="mb-6 scroll-mt-20 md:mb-10 lg:mb-14">
        <SectionHeader
          eyebrow="Timeline"
          title="证据时间线"
          description="结构化记录归档 · 状态跟踪 · 导出与复查"
          align="center"
        />
        {content}

        <p className="mt-4 text-center text-[11px] text-slate-400">
          记录保存在本机浏览器 · 共 {records.length} 条 · 当前显示 {visibleRecords.length} 条
        </p>
        {records.length > 0 && (
          <p className="mt-2 text-center">
            <button
              type="button"
              className="text-[11px] font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-red-600"
              onClick={() => {
                if (
                  window.confirm(
                    "清空本机全部记录？此操作不可恢复，可释放浏览器存储空间。",
                  )
                ) {
                  clearAllRecords();
                  setRecords([]);
                }
              }}
            >
              清空本机记录（释放空间）
            </button>
          </p>
        )}
      </section>
    </ScrollReveal>
  );
}
