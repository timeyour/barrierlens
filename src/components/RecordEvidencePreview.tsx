"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ensureGsapPlugins, gsap, useGSAP } from "@/lib/gsapClient";
import type { ReviewStatus, StoredRecord } from "@/types/analysis";
import { useRef } from "react";

interface RecordEvidencePreviewProps {
  record: StoredRecord;
  reviewStatus: ReviewStatus;
}

ensureGsapPlugins();

export default function RecordEvidencePreview({
  record,
  reviewStatus,
}: RecordEvidencePreviewProps) {
  const flipRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const hasBefore = Boolean(record.imageDataUrl);
  const hasAfter = Boolean(record.reviewImageDataUrl);
  const canCompare = hasBefore && hasAfter;
  const isFixed = reviewStatus === "fixed";
  const isUnfixed = reviewStatus === "unfixed";

  useGSAP(
    () => {
      if (!flipRef.current || reducedMotion || !canCompare) return;
      if (isFixed) {
        gsap.fromTo(
          flipRef.current,
          { rotateY: -72, autoAlpha: 0.5, transformOrigin: "center center" },
          {
            rotateY: 0,
            autoAlpha: 1,
            duration: 0.65,
            ease: "power2.out",
          },
        );
      }
    },
    {
      scope: flipRef,
      dependencies: [isFixed, canCompare, reducedMotion],
      revertOnUpdate: true,
    },
  );

  if (!hasBefore && !hasAfter) return null;

  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-slate-600">现场证据</p>
        {canCompare && (
          <span className="text-[10px] text-slate-400">同一点位 · 两次拍摄</span>
        )}
      </div>

      {canCompare ? (
        <div
          ref={flipRef}
          className={`grid grid-cols-2 gap-2 rounded-xl border p-2 ${
            isFixed
              ? "border-emerald-300 bg-emerald-50/50"
              : isUnfixed
                ? "border-red-200 bg-red-50/30"
                : "border-slate-200 bg-slate-50/80"
          }`}
          style={{ perspective: 900 }}
        >
          <figure className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={record.imageDataUrl}
              alt="反馈时现场"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="px-2 py-1 text-center text-[10px] font-medium text-slate-500">
              反馈时
            </figcaption>
          </figure>
          <figure className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={record.reviewImageDataUrl}
              alt="整改后现场"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="px-2 py-1 text-center text-[10px] font-medium text-slate-500">
              整改后
            </figcaption>
          </figure>
          {isFixed && (
            <p className="col-span-2 rounded-md bg-emerald-100 px-2 py-1.5 text-center text-[10px] font-semibold text-emerald-800">
              整改证据已闭环 · 前后对比可复查
            </p>
          )}
          {isUnfixed && (
            <p className="col-span-2 rounded-md bg-red-100 px-2 py-1.5 text-center text-[10px] font-semibold text-red-800">
              仍未整改 · 请继续跟进
            </p>
          )}
        </div>
      ) : (
        <figure className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={record.imageDataUrl ?? record.reviewImageDataUrl}
            alt="现场照片"
            className="aspect-[2/1] w-full object-cover"
          />
          <figcaption className="px-3 py-2 text-[10px] text-slate-500">
            {hasBefore ? "反馈时现场 · 上传整改复拍后可对比" : "仅有整改照片"}
          </figcaption>
        </figure>
      )}
    </div>
  );
}
