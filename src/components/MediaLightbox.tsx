"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5, 2, 2.5] as const;

interface MediaLightboxProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  zoomable?: boolean;
}

export default function MediaLightbox({
  open,
  title,
  onClose,
  children,
  zoomable = false,
}: MediaLightboxProps) {
  const [zoomIndex, setZoomIndex] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setZoomIndex(1);
  }, [open]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const zoom = ZOOM_STEPS[zoomIndex];
  const canZoomOut = zoomIndex > 0;
  const canZoomIn = zoomIndex < ZOOM_STEPS.length - 1;

  const zoomStyle: CSSProperties | undefined = zoomable
    ? ({ zoom } as CSSProperties)
    : undefined;

  const overlay = (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/92"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <header
        className="flex shrink-0 items-center justify-between gap-2 border-b border-white/15 bg-black/80 px-3 py-2.5 backdrop-blur-sm sm:px-4"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          ← 返回
        </button>
        <p className="hidden truncate px-2 text-sm font-medium text-white sm:block">
          {title}
        </p>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {zoomable && (
            <>
              <button
                type="button"
                disabled={!canZoomOut}
                onClick={() => setZoomIndex((index) => Math.max(0, index - 1))}
                className="rounded-lg bg-white/15 px-2.5 py-2 text-xs font-semibold text-white hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
              >
                缩小
              </button>
              <span className="min-w-[3rem] text-center text-xs tabular-nums text-white/85 sm:text-sm">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                disabled={!canZoomIn}
                onClick={() =>
                  setZoomIndex((index) => Math.min(ZOOM_STEPS.length - 1, index + 1))
                }
                className="rounded-lg bg-white/15 px-2.5 py-2 text-xs font-semibold text-white hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
              >
                放大
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className="min-h-0 flex-1 overflow-auto overscroll-contain"
          onClick={onClose}
        >
          <div className="flex min-h-full items-center justify-center px-3 py-6 sm:px-6 sm:py-10">
            <div
              className="mx-auto w-full max-w-5xl"
              style={zoomStyle}
              onClick={(event) => event.stopPropagation()}
            >
              {children}
            </div>
          </div>
        </div>

        <footer
          className="shrink-0 border-t border-white/15 bg-black/80 px-3 py-3 backdrop-blur-sm sm:hidden"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="mb-2 text-center text-[11px] text-white/45">点击空白处也可返回</p>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary w-full rounded-xl py-3 text-sm font-semibold"
          >
            返回查看结果
          </button>
        </footer>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
