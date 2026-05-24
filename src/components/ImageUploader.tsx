"use client";

import { useCallback, useRef, useState } from "react";

interface ImageUploaderProps {
  previewUrl: string | null;
  onImageSelect: (file: File, previewUrl: string) => void;
  disabled?: boolean;
}

export default function ImageUploader({
  previewUrl,
  onImageSelect,
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

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) inputRef.current?.click();
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
        <p className="text-sm font-medium text-slate-700">
          点击或拖拽上传现场照片
        </p>
        <p className="mt-1 text-xs text-slate-500">支持 JPG、PNG、WEBP</p>
      </div>

      {previewUrl && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="现场照片预览"
            className="max-h-64 w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
