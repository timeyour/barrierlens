"use client";

import { useCallback, useRef, useState } from "react";

interface ImageUploaderProps {
  previewUrl: string | null;
  onImageSelect: (file: File, previewUrl: string) => void;
  onClear?: () => void;
  disabled?: boolean;
}

export default function ImageUploader({
  previewUrl,
  onImageSelect,
  onClear,
  disabled = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      onImageSelect(file, url);
    },
    [onImageSelect],
  );

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (inputRef.current) inputRef.current.value = "";
    onClear?.();
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const openFilePicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <button
            type="button"
            disabled={disabled}
            onClick={openFilePicker}
            className={`block w-full text-left ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="现场照片预览"
              className="max-h-72 w-full object-cover"
            />
            {!disabled && (
              <p className="bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
                点击照片可更换 · 支持 JPG、PNG、WEBP
              </p>
            )}
          </button>
          {onClear && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-2 rounded-lg border border-white/80 bg-slate-900/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-slate-900"
            >
              删除重拍
            </button>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={openFilePicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openFilePicker();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <svg
            className="mb-3 h-10 w-10 text-blue-500"
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
          <p className="text-sm font-medium text-slate-700">点击或拖拽上传现场照片</p>
          <p className="mt-1 text-xs text-slate-500">支持 JPG、PNG、WEBP</p>
        </div>
      )}
    </div>
  );
}
