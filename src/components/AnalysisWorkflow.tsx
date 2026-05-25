"use client";

import AnchorLink from "@/components/AnchorLink";
import SectionHeader from "@/components/SectionHeader";
import { useCallback, useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import TargetSelector from "@/components/TargetSelector";
import ModeSelector from "@/components/ModeSelector";
import LocationInput from "@/components/LocationInput";
import AnalysisResultView from "@/components/AnalysisResult";
import AiAnalysisPipeline from "@/components/AiAnalysisPipeline";
import GemmaJsonOutput from "@/components/GemmaJsonOutput";
import ReportCard from "@/components/ReportCard";
import { downloadMarkdownReport } from "@/lib/exportMarkdown";
import { compressImageForUpload, fileToStoredImageDataUrl } from "@/lib/imageUtils";
import { saveRecord } from "@/lib/recordStore";
import { scrollToAnchor } from "@/lib/scrollAnchor";
import type {
  AnalysisResult,
  AnalysisSource,
  RecordMode,
  StoredRecord,
  TargetDepartment,
} from "@/types/analysis";
import { RECORD_MODES } from "@/types/analysis";

type WorkflowStatus = "idle" | "loading" | "success" | "error";

const DEMO_IMAGE_URL = "/images/scene-blocked-close.png";

type AnalyzeApiResponse = AnalysisResult & {
  mockMode?: boolean;
  analysisSource?: AnalysisSource;
  modelName?: string;
  provider?: string;
  fallbackReason?: string;
  analysisTimeMs?: number;
};

async function fetchDemoFile(): Promise<File> {
  const response = await fetch(DEMO_IMAGE_URL);
  const blob = await response.blob();
  return new File([blob], "demo-scene-blocked-close.png", {
    type: blob.type || "image/png",
  });
}

export default function AnalysisWorkflow() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetDepartment, setTargetDepartment] =
    useState<TargetDepartment>("物业");
  const [recordMode, setRecordMode] = useState<RecordMode>("public");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [mockMode, setMockMode] = useState(false);
  const [analysisSource, setAnalysisSource] = useState<AnalysisSource | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [analysisTimeMs, setAnalysisTimeMs] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [usedDemoImage, setUsedDemoImage] = useState(false);

  const handleImageSelect = useCallback((selected: File, url: string) => {
    setFile(selected);
    setPreviewUrl(url);
    setUsedDemoImage(false);
    setResult(null);
    setAnalysisSource(null);
    setModelName(null);
    setFallbackReason(null);
    setAnalysisTimeMs(null);
    setStatus("idle");
    setErrorMessage(null);
    setSavedNotice(false);
  }, []);

  const handleClearImage = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setUsedDemoImage(false);
    setResult(null);
    setAnalysisSource(null);
    setModelName(null);
    setFallbackReason(null);
    setAnalysisTimeMs(null);
    setStatus("idle");
    setErrorMessage(null);
    setSavedNotice(false);
  }, [previewUrl]);

  const loadDemoImage = useCallback(async () => {
    try {
      const demoFile = await fetchDemoFile();
      const url = URL.createObjectURL(demoFile);
      handleImageSelect(demoFile, url);
      setUsedDemoImage(true);
      setErrorMessage(null);
    } catch {
      setErrorMessage("样例图加载失败，请手动上传照片");
    }
  }, [handleImageSelect]);

  const handleReset = useCallback(() => {
    handleClearImage();
    setCopySuccess(false);
  }, [handleClearImage]);

  const persistRecord = async (data: AnalysisResult, imageFile: File | null) => {
    let imageDataUrl: string | undefined;
    if (imageFile) {
      try {
        imageDataUrl = await fileToStoredImageDataUrl(imageFile);
      } catch {
        imageDataUrl = undefined;
      }
    }

    const stored: StoredRecord = {
      ...data,
      id: crypto.randomUUID(),
      location: data.location || location.trim() || "地点未标注",
      recordMode: data.recordMode ?? recordMode,
      reviewStatus: data.reviewStatus ?? "pending",
      recordedAt: data.recordedAt ?? new Date().toISOString(),
      imageDataUrl,
    };
    saveRecord(stored);
    setSavedNotice(true);
  };

  const handleAnalyze = async () => {
    let analyzeFile = file;

    if (!analyzeFile) {
      try {
        analyzeFile = await fetchDemoFile();
        const demoPreview = URL.createObjectURL(analyzeFile);
        setFile(analyzeFile);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return demoPreview;
        });
        setUsedDemoImage(true);
      } catch {
        setErrorMessage("请先上传现场照片，或使用样例图");
        return;
      }
    }

    setStatus("loading");
    setErrorMessage(null);
    setResult(null);
    setSavedNotice(false);
    setAnalysisSource(null);
    setModelName(null);
    setFallbackReason(null);
    setAnalysisTimeMs(null);

    const formData = new FormData();
    const uploadFile = await compressImageForUpload(analyzeFile);
    formData.append("image", uploadFile);
    formData.append("targetDepartment", targetDepartment);
    formData.append("recordMode", recordMode);
    if (location.trim()) formData.append("location", location.trim());

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const rawText = await response.text();
      let data: AnalyzeApiResponse & { error?: string };
      try {
        data = JSON.parse(rawText) as AnalyzeApiResponse & { error?: string };
      } catch {
        if (response.status === 413) {
          throw new Error("图片过大，请换一张或使用样例图体验");
        }
        throw new Error(
          rawText.startsWith("Request")
            ? "服务器拒绝请求（可能图片过大），请使用样例图或换一张较小的照片"
            : "分析失败，请稍后重试",
        );
      }

      if (!response.ok) {
        throw new Error(data.error ?? "分析失败");
      }

      const {
        mockMode: responseMockMode,
        analysisSource: responseSource,
        modelName: responseModelName,
        fallbackReason: responseFallbackReason,
        analysisTimeMs: responseAnalysisTimeMs,
        ...analysis
      } = data;
      setResult(analysis);
      setMockMode(Boolean(responseMockMode));
      setAnalysisSource(responseSource ?? (responseMockMode ? "mock" : "gemma"));
      setModelName(responseModelName ?? null);
      setFallbackReason(responseFallbackReason ?? null);
      setAnalysisTimeMs(responseAnalysisTimeMs ?? null);
      setStatus("success");
      await persistRecord(analysis, analyzeFile);
      window.requestAnimationFrame(() => scrollToAnchor("#tool-results"));
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "分析失败，请稍后重试",
      );
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.reportText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setErrorMessage("复制失败，请手动选择文本复制");
    }
  };

  const handleExport = () => {
    if (!result) return;
    downloadMarkdownReport(result, undefined, recordMode);
  };

  const isLoading = status === "loading";
  const canGenerate = !isLoading;
  const reportTitle =
    recordMode === "inspection" ? "巡查整改单" : "公众倡导摘要";

  return (
    <div className="space-y-8">
      <div className="glass-card p-4 sm:p-6 lg:p-8">
        <SectionHeader
          eyebrow="AI Pipeline"
          title="记录无障碍问题"
          description="拍照上传 → AI 分析 → 归档时间线 → 整改复查"
          descriptionClassName="hidden md:block"
        />
        <p className="-mt-4 mb-2 text-sm text-slate-600 md:hidden">
          拍照上传，AI 帮你结构化记录并归档
        </p>

        <div className="-mt-2 space-y-6">
          <ImageUploader
            previewUrl={previewUrl}
            onImageSelect={handleImageSelect}
            onClear={handleClearImage}
            disabled={isLoading}
          />

          {!previewUrl && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void loadDemoImage()}
              className="w-full rounded-xl border border-dashed border-blue-300 bg-blue-50/50 px-4 py-2.5 text-sm font-medium text-blue-800 transition hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
            >
              使用样例图体验（无需选文件）
            </button>
          )}

          {usedDemoImage && previewUrl && (
            <p className="text-xs text-blue-700">
              当前为样例图；也可上传自己的现场照片替换。
            </p>
          )}

          <ModeSelector
            value={recordMode}
            onChange={setRecordMode}
            disabled={isLoading}
          />

          <details className="rounded-xl border border-slate-200/80 bg-slate-50/40 md:hidden">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">
              选填：地点 · 场景归类
            </summary>
            <div className="space-y-4 border-t border-slate-200/80 px-4 pb-4 pt-3">
              <LocationInput
                value={location}
                onChange={setLocation}
                disabled={isLoading}
              />
              <TargetSelector
                value={targetDepartment}
                onChange={setTargetDepartment}
                disabled={isLoading}
              />
            </div>
          </details>

          <div className="hidden space-y-6 md:block">
            <LocationInput
              value={location}
              onChange={setLocation}
              disabled={isLoading}
            />
            <TargetSelector
              value={targetDepartment}
              onChange={setTargetDepartment}
              disabled={isLoading}
            />
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!canGenerate}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Gemma 4 分析中…
              </>
            ) : (
              `生成${RECORD_MODES[recordMode].label}`
            )}
          </button>

          {(isLoading || result) && (
            <AiAnalysisPipeline running={isLoading} result={isLoading ? null : result} />
          )}

          {errorMessage && (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {analysisSource === "gemma" && status === "success" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <strong>真实模型：</strong>
          本次结果来自 {modelName ?? "Gemma 4"} 多模态分析
          {analysisTimeMs ? `，耗时 ${analysisTimeMs}ms` : ""}。
        </div>
      )}

      {analysisSource === "mock_fallback" && status === "success" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>已自动降级：</strong>
          Gemma 4 接口调用失败，当前结果使用 Mock 数据兜底。
          {fallbackReason ? ` 原因：${fallbackReason}` : ""}
        </div>
      )}

      {analysisSource === "mock" && mockMode && status === "success" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>演示模式：</strong>
          未配置 GEMINI_API_KEY，推理步骤与 JSON 结构按真实 Gemma 输出格式模拟；在 .env.local 配置密钥后切换为 gemma-4-26b-a4b-it。
        </div>
      )}

      {savedNotice && status === "success" && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          已归档到本机<strong>问题记录时间线</strong>，
          <AnchorLink href="#records" className="font-semibold text-blue-800 underline">
            查看时间线
          </AnchorLink>
        </div>
      )}

      {result && status === "success" && (
        <div id="tool-results" className="scroll-mt-20 space-y-6">
          <div className="glass-card p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-slate-900">结构化记录</h2>
            <p className="mt-1 text-sm text-slate-500">
              AI 分析结果 · {RECORD_MODES[recordMode].label}
            </p>
            <div className="mt-6">
              <AnalysisResultView result={result} recordMode={recordMode} />
            </div>
            <div className="mt-6">
              <ReportCard title={reportTitle} reportText={result.reportText} />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={handleCopy}
              className="btn-primary flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-white sm:flex-none sm:min-w-[140px]"
            >
              {copySuccess ? "已复制 ✓" : `复制${reportTitle}`}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="btn-secondary flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 sm:flex-none sm:min-w-[140px]"
            >
              导出 Markdown
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 sm:flex-none sm:min-w-[140px]"
            >
              继续记录
            </button>
          </div>

          <details className="rounded-2xl border border-slate-200 bg-slate-50/60">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-600">
              Gemma 4 结构化输出（开发者）
            </summary>
            <div className="border-t border-slate-200 p-3 pt-0">
              <GemmaJsonOutput
                result={result}
                mockMode={mockMode}
                source={analysisSource}
                modelName={modelName}
                fallbackReason={fallbackReason}
              />
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
