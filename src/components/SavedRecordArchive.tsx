"use client";

import Link from "next/link";
import BarrierMap from "@/components/BarrierMap";
import PhotoCompareSlider from "@/components/PhotoCompareSlider";
import ReportLocationMap from "@/components/ReportLocationMap";
import PhotoAccessRequestsPanel from "@/components/PhotoAccessRequestsPanel";
import SpatialDiagnosisTags from "@/components/SpatialDiagnosisTags";
import { downloadPdfReport } from "@/lib/exportPdf";
import { displayLocationLabel } from "@/lib/locationValidation";
import { formatRecordTime } from "@/lib/recordStore";
import {
  RECORD_MODES,
  REVIEW_STATUS_LABELS,
  SCENE_TYPE_LABELS,
  type StoredRecord,
} from "@/types/analysis";

interface SavedRecordArchiveProps {
  record: StoredRecord;
}

function downloadImage(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

export default function SavedRecordArchive({ record }: SavedRecordArchiveProps) {
  const locationLabel = displayLocationLabel(record.location);
  const hasCoords = record.lat != null && record.lng != null;
  const hasBefore = Boolean(record.imageDataUrl);
  const hasAfter = Boolean(record.reviewImageDataUrl);
  const summary =
    record.recordMode === "inspection"
      ? record.inspectionText || record.reportText
      : record.advocacyText || record.reportText;

  return (
    <article className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">本机档案</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              {record.issueType}
            </h1>
            <p className="mt-2 text-sm text-slate-600">{locationLabel}</p>
            <p className="mt-1 text-xs text-slate-500">
              {formatRecordTime(record.recordedAt)} ·{" "}
              {RECORD_MODES[record.recordMode]?.label ?? record.recordMode} ·{" "}
              {SCENE_TYPE_LABELS[record.sceneType]}
            </p>
          </div>
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
            {REVIEW_STATUS_LABELS[record.reviewStatus]}
          </span>
        </div>
        <div className="mt-3">
          <SpatialDiagnosisTags record={record} compact />
        </div>
        {record.problemSummary && (
          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
            {record.problemSummary}
          </p>
        )}
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">现场照片</h2>
          {hasBefore && record.imageDataUrl && (
            <button
              type="button"
              onClick={() =>
                downloadImage(record.imageDataUrl!, `无碍-现场-${record.id.slice(0, 8)}.jpg`)
              }
              className="text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              下载现场图
            </button>
          )}
        </div>

        {hasBefore && hasAfter && record.imageDataUrl && record.reviewImageDataUrl ? (
          <div className="mt-4">
            <PhotoCompareSlider
              beforeUrl={record.imageDataUrl}
              afterUrl={record.reviewImageDataUrl}
              beforeLabel="整改前"
              afterLabel="整改后"
            />
          </div>
        ) : hasBefore && record.imageDataUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={record.imageDataUrl}
            alt="现场反馈照片"
            className="mt-4 max-h-[420px] w-full rounded-xl border border-slate-200 object-contain bg-slate-50"
          />
        ) : (
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">
            照片未保存（存储已满时可能发生）
          </p>
        )}

        {hasAfter && record.reviewImageDataUrl && !hasBefore && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={record.reviewImageDataUrl}
            alt="整改复拍"
            className="mt-4 max-h-[420px] w-full rounded-xl border border-slate-200 object-contain bg-slate-50"
          />
        )}
      </section>

      <BarrierMap result={record} />

      {hasCoords ? (
        <ReportLocationMap
          location={locationLabel}
          lat={record.lat ?? null}
          lng={record.lng ?? null}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">大致位置</h3>
          <p className="mt-1 text-sm text-slate-600">{locationLabel}</p>
          <p className="mt-2 text-xs text-slate-500">未保存 GPS · 下次可点「当前位置」</p>
        </div>
      )}

      {summary && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            {record.recordMode === "inspection" ? "巡查整改单" : "公众倡导摘要"}
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {summary}
          </p>
        </section>
      )}

      <PhotoAccessRequestsPanel record={record} />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            void downloadPdfReport(record, {
              mode: record.recordMode,
              imageDataUrl: record.imageDataUrl,
            })
          }
          className="btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          导出 PDF
        </button>
        <Link
          href="/#records"
          className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          时间线
        </Link>
        <Link href="/" className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700">
          继续拍
        </Link>
      </div>

      <p className="text-[11px] text-slate-500">
        完整地址仅在本机。公开到案例池需单独勾选确认，公开后他人可见现场照片（位置仍模糊）。
      </p>
    </article>
  );
}
