"use client";

import {
  formatRecordTime,
  getRecords,
  seedDemoRecordsIfEmpty,
  updateRecordReview,
} from "@/lib/recordStore";
import { fileToStoredImageDataUrl } from "@/lib/imageUtils";
import {
  PATH_STATUS_LABELS,
  RECORD_MODES,
  REVIEW_STATUS_LABELS,
  SCENE_TYPE_LABELS,
  type ReviewStatus,
} from "@/types/analysis";
import type { StoredRecord } from "@/types/analysis";
import BarrierMap from "@/components/BarrierMap";
import PhotoCompareSlider from "@/components/PhotoCompareSlider";
import RecordTimelineFilters from "@/components/RecordTimelineFilters";
import ReviewStatusFlow from "@/components/ReviewStatusFlow";
import SectionHeader from "@/components/SectionHeader";
import ScrollReveal from "@/components/ScrollReveal";
import {
  countByQueue,
  DEFAULT_RECORD_FILTERS,
  filterRecords,
  groupRecordsByLocation,
  type RecordFilterState,
} from "@/lib/recordFilters";
import { useEffect, useRef, useState } from "react";

const REVIEW_FLOW: ReviewStatus[] = [
  "pending",
  "exported",
  "reported",
  "review_pending",
  "fixed",
  "unfixed",
];

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

function RecordItem({ record }: { record: StoredRecord }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nextStatus, setNextStatus] = useState<ReviewStatus>(record.reviewStatus);
  const [reviewNote, setReviewNote] = useState(record.reviewNote ?? "");
  const [showMap, setShowMap] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    setNextStatus(record.reviewStatus);
    setReviewNote(record.reviewNote ?? "");
  }, [record.reviewStatus, record.reviewNote, record.id]);

  const modeLabel = RECORD_MODES[record.recordMode].label;
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
    if (!file || !file.type.startsWith("image/")) return;
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
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 transition-colors duration-500">
          {REVIEW_STATUS_LABELS[record.reviewStatus]}
        </span>
        {record.reviewImageDataUrl && (
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
            已上传整改照片
          </span>
        )}
        <span className="text-[11px] text-slate-400">
          {formatRecordTime(record.recordedAt)}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">
        {record.issueType} · {record.location || "地点未标注"}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        {SCENE_TYPE_LABELS[record.sceneType]} · 路径状态：{PATH_STATUS_LABELS[record.pathStatus]}
      </p>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
        {record.sceneDescription}
      </p>
      {preview && (
        <p className="mt-2 line-clamp-2 text-[11px] text-slate-400">
          {preview.slice(0, 120)}…
        </p>
      )}

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
              placeholder="复查备注（如：已清理，待复拍）"
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
    </li>
  );
}

export default function RecordTimeline() {
  const [records, setRecords] = useState<StoredRecord[]>(EMPTY_RECORDS);
  const [filters, setFilters] = useState<RecordFilterState>(DEFAULT_RECORD_FILTERS);

  useEffect(() => {
    seedDemoRecordsIfEmpty();
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
  const visibleRecords = filterRecords(records, filters);
  const grouped = groupRecordsByLocation(visibleRecords);

  return (
    <ScrollReveal>
      <section
        id="records"
        className="mb-6 scroll-mt-20 md:mb-10 lg:mb-14"
      >
        <SectionHeader
          eyebrow="Records"
          title="问题记录时间线"
          description="工作队列默认展示待处理与待复查；支持搜索、筛选与按地点聚合。"
          align="center"
          descriptionClassName="hidden md:block"
        />

        <RecordTimelineFilters
          filters={filters}
          onChange={setFilters}
          counts={counts}
        />

        {visibleRecords.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            没有匹配的记录。试试切换「全部」或清空搜索关键词。
          </p>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ location, records: groupRecords }) => (
              <div key={location}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">{location}</h3>
                  <span className="text-[11px] text-slate-400">
                    {groupRecords.length} 条
                  </span>
                </div>
                <ul className="space-y-3">
                  {groupRecords.map((record) => (
                    <RecordItem key={record.id} record={record} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-center text-[11px] text-slate-400">
          记录保存在本机浏览器 · 共 {records.length} 条 · 当前显示 {visibleRecords.length} 条
        </p>
      </section>
    </ScrollReveal>
  );
}
