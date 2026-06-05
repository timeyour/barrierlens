"use client";

import MediaLightbox from "@/components/MediaLightbox";
import ReportLocationMap from "@/components/ReportLocationMap";
import SceneFindingPanel from "@/components/SceneFindingPanel";
import ScenePhotoFrame from "@/components/ScenePhotoFrame";
import { sanitizeLocationForStorage } from "@/lib/locationValidation";
import { resolveScenePhotoModel } from "@/lib/scenePhotoModel";
import { useMemo, useState } from "react";
import type { ReportResultPanelResult } from "@/components/ReportResultPanel";

interface ReportEvidenceLayoutProps {
  result: ReportResultPanelResult;
  showLocationMap?: boolean;
}

/** 照片内左侧叠标注，下方放大致位置地图 */
export default function ReportEvidenceLayout({
  result,
  showLocationMap = true,
}: ReportEvidenceLayoutProps) {
  const [compareView, setCompareView] = useState<"before" | "after">("before");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const model = useMemo(
    () => resolveScenePhotoModel(result, compareView),
    [result, compareView],
  );

  const hasReviewPhoto = Boolean(result.reviewImageDataUrl);
  const photoAlt =
    compareView === "after" && hasReviewPhoto ? "整改后现场" : "反馈现场";
  const locationLabel = sanitizeLocationForStorage(result.location) || "已定位路段";

  const overlayPanel = (
    <SceneFindingPanel
      blockedPath={model.blockedPath}
      statusLabel={model.statusLabel}
      activeStatus={model.activeStatus}
      dangerColor={model.dangerColor}
      obstacles={model.obstacles}
      variant="overlay"
    />
  );

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-2.5 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-600">现场照片 · 左侧标注</p>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] text-slate-600 ring-1 ring-slate-200">
              {model.usingUserPhoto ? result.issueType : model.config.title}
            </span>
          </div>

          {hasReviewPhoto && (
            <div className="mt-2 inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setCompareView("before")}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                  compareView === "before"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600"
                }`}
              >
                整改前
              </button>
              <button
                type="button"
                onClick={() => setCompareView("after")}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                  compareView === "after"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600"
                }`}
              >
                整改后
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group relative block w-full text-left"
          aria-label="放大查看现场照片与左侧标注"
        >
          <ScenePhotoFrame
            mapPhoto={model.mapPhoto}
            alt={photoAlt}
            size="hero"
            usingUserPhoto={model.usingUserPhoto}
            overlay={overlayPanel}
          />
          <span className="absolute right-3 top-3 z-40 rounded-md bg-black/55 px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
            点击放大
          </span>
        </button>

        {showLocationMap && (
          <div className="border-t border-slate-100 p-3 sm:p-4">
            <ReportLocationMap
              location={locationLabel}
              lat={result.lat ?? null}
              lng={result.lng ?? null}
              dense
              embedded
            />
          </div>
        )}
      </div>

      <MediaLightbox
        open={lightboxOpen}
        title="现场照片 · 左侧标注"
        zoomable
        onClose={() => setLightboxOpen(false)}
      >
        <ScenePhotoFrame
          mapPhoto={model.mapPhoto}
          alt={photoAlt}
          size="expanded"
          usingUserPhoto={model.usingUserPhoto}
          overlay={overlayPanel}
        />
      </MediaLightbox>
    </>
  );
}
