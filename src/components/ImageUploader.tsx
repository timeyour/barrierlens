"use client";

import {
  IMAGE_FILE_ACCEPT,
  imageFileRejectReason,
} from "@/lib/imageUtils";
import { useCallback, useId, useRef, useState } from "react";

const PRIVACY_HINT = "避免正脸与车牌";

interface ImageUploaderProps {
  previewUrl: string | null;
  onImageSelect: (file: File, previewUrl: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  /** default 标准 | hero 大上传区 | compact 工作台一屏 */
  variant?: "default" | "hero" | "compact";
  flow?: boolean;
}

export default function ImageUploader({
  previewUrl,
  onImageSelect,
  onClear,
  disabled = false,
  variant = "default",
  flow = false,
}: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rejectMessage, setRejectMessage] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      const rejectReason = imageFileRejectReason(file);
      if (rejectReason) {
        setRejectMessage(rejectReason);
        return;
      }
      setRejectMessage(null);
      const url = URL.createObjectURL(file);
      onImageSelect(file, url);
    },
    [onImageSelect],
  );

  const openFilePicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (inputRef.current) inputRef.current.value = "";
    setRejectMessage(null);
    onClear?.();
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const dropMinH =
    variant === "hero"
      ? "min-h-[220px] sm:min-h-[260px]"
      : variant === "compact"
        ? "min-h-[120px] sm:min-h-[140px]"
        : "min-h-[180px]";

  const previewMaxH =
    variant === "hero"
      ? "max-h-[min(56vh,520px)]"
      : variant === "compact"
        ? "max-h-40 sm:max-h-48"
        : "max-h-[min(48vh,420px)] sm:max-h-[min(52vh,480px)]";

  const dropZoneClass = `relative flex ${dropMinH} flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
    flow
      ? isDragging
        ? "border-sky-400/80 bg-white/10"
        : "border-white/20 bg-white/[0.03] hover:border-sky-400/50 hover:bg-white/[0.06]"
      : isDragging
        ? "border-blue-600 bg-blue-50"
        : "border-slate-300 bg-white hover:border-blue-500 hover:bg-slate-50"
  } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`;

  const fileInput = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      accept={IMAGE_FILE_ACCEPT}
      aria-label="上传图片"
      className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      disabled={disabled}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
      }}
    />
  );

  return (
    <div className="relative z-10">
      {previewUrl ? (
        <div
          className={`relative overflow-hidden rounded-2xl border ${
            flow ? "border-white/15 bg-white/5" : "border-slate-200 bg-white"
          }`}
        >
          {!disabled && fileInput}
          <div
            className={`relative block w-full text-left ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            onClick={openFilePicker}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openFilePicker();
              }
            }}
            role="button"
            tabIndex={disabled ? -1 : 0}
          >
            <div
              className={`flex min-h-[140px] items-center justify-center sm:min-h-[180px] ${
                flow ? "bg-slate-950/40" : "bg-slate-900"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="现场照片预览"
                className={`w-full object-contain ${previewMaxH}`}
              />
            </div>
            {!disabled && (
              <p
                className={`px-3 py-2 text-center text-xs ${
                  flow ? "bg-white/5 text-white/50" : "bg-slate-50 text-slate-500"
                }`}
              >
                点击更换
              </p>
            )}
          </div>
          {onClear && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-2 z-30 rounded-lg border border-white/80 bg-slate-900/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-slate-900"
            >
              删除重拍
            </button>
          )}
        </div>
      ) : (
        <div className={`relative ${disabled ? "cursor-not-allowed opacity-60" : ""}`}>
          {!disabled && fileInput}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={openFilePicker}
            onKeyDown={(event) => {
              if (disabled) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openFilePicker();
              }
            }}
            role="button"
            tabIndex={disabled ? -1 : 0}
            className={dropZoneClass}
          >
            <svg
              className={`mb-4 h-12 w-12 ${flow ? "text-sky-300" : "text-blue-600"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className={`text-base font-semibold ${flow ? "text-white" : "text-slate-800"}`}>
              {variant === "hero" ? "拖入或选择照片" : "上传现场照片"}
            </p>
            {!flow && (
              <p className="mt-1.5 text-sm text-slate-500">支持 JPG、PNG、WEBP · 也可使用样例图</p>
            )}
            {!disabled && (
              <span
                className={`mt-4 inline-flex rounded-lg px-4 py-2 text-sm font-semibold ${
                  flow
                    ? "border border-white/25 bg-white/10 text-white"
                    : "border border-slate-300 bg-white text-slate-800"
                }`}
              >
                选择照片
              </span>
            )}
          </div>
        </div>
      )}
      {rejectMessage && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {rejectMessage}
        </p>
      )}
      <p className={`mt-2 text-xs ${flow ? "text-white/40" : "leading-relaxed text-slate-500"}`}>
        {PRIVACY_HINT}
      </p>
    </div>
  );
}
