"use client";

import MediaLightbox from "@/components/MediaLightbox";
import SceneFindingPanel from "@/components/SceneFindingPanel";
import ScenePhotoFrame from "@/components/ScenePhotoFrame";
import { displayLocationLabel } from "@/lib/locationValidation";
import { resolveScenePhotoModel } from "@/lib/scenePhotoModel";
import { useMemo, useState } from "react";
import type { AnalysisResult } from "@/types/analysis";

interface BarrierMapProps {
  result: AnalysisResult & {
    imageDataUrl?: string;
    reviewImageDataUrl?: string;
    location?: string;
    lat?: number | null;
    lng?: number | null;
  };
  compact?: boolean;
  dense?: boolean;
}

export default function BarrierMap({
  result,
  compact = false,
  dense = false,
}: BarrierMapProps) {
  const [compareView, setCompareView] = useState<"before" | "after">("before");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const model = useMemo(
    () => resolveScenePhotoModel(result, compareView),
    [result, compareView],
  );

  const hasReviewPhoto = Boolean(result.reviewImageDataUrl);
  const mapTitle = model.usingUserPhoto ? result.issueType : model.config.title;
  const photoAlt =
    compareView === "after" && hasReviewPhoto ? "整改后现场" : "反馈现场";

  const overlayPanel = (
    <SceneFindingPanel
      blockedPath={model.blockedPath}
      statusLabel={model.statusLabel}
      activeStatus={model.activeStatus}
      dangerColor={model.dangerColor}
      obstacles={model.obstacles}
      dense={dense}
      variant="overlay"
    />
  );

  return (
    <div className={compact ? "space-y-3" : "rounded-2xl border border-slate-200 bg-white p-5"}>
      {!compact && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">现场照片 · 左侧标注</h3>
            {displayLocationLabel(result.location, "") && (
              <p className="mt-0.5 text-[11px] text-slate-500">
                {displayLocationLabel(result.location, "")}
              </p>
            )}
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
            {mapTitle}
          </span>
        </div>
      )}

      {hasReviewPhoto && (
        <div className="mb-3 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setCompareView("before")}
            className={`rounded-md px-3 py-1 text-xs font-semibold ${
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
            className={`rounded-md px-3 py-1 text-xs font-semibold ${
              compareView === "after"
                ? "bg-slate-900 text-white"
                : "text-slate-600"
            }`}
          >
            整改后
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative block w-full text-left transition hover:ring-2 hover:ring-blue-400/60 rounded-xl"
        aria-label="放大查看现场照片与左侧标注"
      >
        <ScenePhotoFrame
          mapPhoto={model.mapPhoto}
          alt={photoAlt}
          size={dense ? "compact" : "default"}
          usingUserPhoto={model.usingUserPhoto}
          overlay={overlayPanel}
        />
        <span className="absolute right-2 top-2 z-40 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
          点击放大
        </span>
      </button>

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
    </div>
  );
}
