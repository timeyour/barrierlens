"use client";

import AnchorLink from "@/components/AnchorLink";
import { useCallback, useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import TargetSelector from "@/components/TargetSelector";
import ModeSelector from "@/components/ModeSelector";
import LocationInput from "@/components/LocationInput";
import AnalysisResultView from "@/components/AnalysisResult";
import AiAnalysisPipeline from "@/components/AiAnalysisPipeline";
import GemmaJsonOutput from "@/components/GemmaJsonOutput";
import ReportCard from "@/components/ReportCard";
import WizardStepIndicator from "@/components/WizardStepIndicator";
import ReportNextSteps from "@/components/ReportNextSteps";
import { downloadMarkdownReport } from "@/lib/exportMarkdown";
import { compressImageForUpload, fileToStoredImageDataUrl } from "@/lib/imageUtils";
import { saveRecord, updateRecordReview } from "@/lib/recordStore";
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
type WizardStep = 1 | 2 | 3;

const DEMO_IMAGE_URL = "/images/scene-blocked-close.png";
const ANALYZE_CLIENT_TIMEOUT_MS = 35000;

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
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
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
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [exportedMarked, setExportedMarked] = useState(false);
  const [usedDemoImage, setUsedDemoImage] = useState(false);

  const resetAnalysis = useCallback(() => {
    setResult(null);
    setAnalysisSource(null);
    setModelName(null);
    setFallbackReason(null);
    setAnalysisTimeMs(null);
    setStatus("idle");
    setSavedNotice(false);
    setSavedRecordId(null);
    setExportedMarked(false);
  }, []);

  const handleImageSelect = useCallback(
    (selected: File, url: string) => {
      setFile(selected);
      setPreviewUrl(url);
      setUsedDemoImage(false);
      resetAnalysis();
      setErrorMessage(null);
      setWizardStep(2);
    },
    [resetAnalysis],
  );

  const handleClearImage = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setUsedDemoImage(false);
    resetAnalysis();
    setErrorMessage(null);
    setWizardStep(1);
  }, [previewUrl, resetAnalysis]);

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
    setWizardStep(1);
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

    const id = crypto.randomUUID();
    const stored: StoredRecord = {
      ...data,
      id,
      location: data.location || location.trim() || "地点未标注",
      recordMode: data.recordMode ?? recordMode,
      targetDepartment: data.targetDepartment ?? targetDepartment,
      reviewStatus: data.reviewStatus ?? "pending",
      recordedAt: data.recordedAt ?? new Date().toISOString(),
      imageDataUrl,
    };
    saveRecord(stored);
    setSavedRecordId(id);
    setSavedNotice(true);
    return id;
  };

  const markRecordExported = useCallback(() => {
    if (!savedRecordId) return;
    updateRecordReview(savedRecordId, { reviewStatus: "exported" });
    setResult((prev) =>
      prev && prev.reviewStatus === "pending"
        ? { ...prev, reviewStatus: "exported" }
        : prev,
    );
    setExportedMarked(true);
  }, [savedRecordId]);

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
    resetAnalysis();

    const formData = new FormData();
    const uploadFile = await compressImageForUpload(analyzeFile);
    formData.append("image", uploadFile);
    formData.append("targetDepartment", targetDepartment);
    formData.append("recordMode", recordMode);
    if (location.trim()) formData.append("location", location.trim());

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        ANALYZE_CLIENT_TIMEOUT_MS,
      );

      let response: Response;
      try {
        response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeoutId);
      }

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
      if (error instanceof Error && error.name === "AbortError") {
        setErrorMessage("分析超时，请使用样例图或稍后重试");
        return;
      }
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
      markRecordExported();
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setErrorMessage("复制失败，请手动选择文本复制");
    }
  };

  const handleExport = () => {
    if (!result) return;
    downloadMarkdownReport(result, undefined, recordMode);
    markRecordExported();
  };

  const isLoading = status === "loading";
  const showWizard = status !== "success";
  const reportTitle =
    recordMode === "inspection"
      ? "无障碍通行空间合规诊断与管理建议书"
      : "公众倡导摘要";

  return (
    <div className="space-y-6">
      {showWizard && (
        <div className="tool-card p-5 sm:p-8">
          <WizardStepIndicator current={wizardStep} />

          {wizardStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">从照片开始</h3>
                <p className="mt-1 text-sm text-slate-600">
                  上传盲道占用或通行受阻的现场照片，或使用样例图体验。
                </p>
              </div>
              <ImageUploader
                variant="hero"
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
                  className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-400 hover:bg-slate-50 disabled:opacity-50"
                >
                  没有照片？使用样例图体验
                </button>
              )}
              {previewUrl && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    下一步：选类别
                  </button>
                </div>
              )}
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">选类别与模式</h3>
                <p className="mt-1 text-sm text-slate-600">
                  选择记录用途与建议责任方（类似市政上报选部门）。
                </p>
              </div>
              {previewUrl && (
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-14 w-14 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1 text-xs text-slate-600">
                    {usedDemoImage ? "样例图已选" : "现场照片已选"}
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="ml-2 font-semibold text-blue-600 underline"
                    >
                      更换
                    </button>
                  </div>
                </div>
              )}
              <ModeSelector
                value={recordMode}
                onChange={setRecordMode}
                disabled={isLoading}
              />
              <TargetSelector
                value={targetDepartment}
                onChange={setTargetDepartment}
                disabled={isLoading}
              />
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  下一步：提交
                </button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">确认并提交</h3>
                <p className="mt-1 text-sm text-slate-600">
                  可选填地点，然后生成结构化诊断报告。
                </p>
              </div>
              <LocationInput
                value={location}
                onChange={setLocation}
                disabled={isLoading}
              />
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">模式：</span>
                  {RECORD_MODES[recordMode].label}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">归类：</span>
                  {targetDepartment}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  disabled={isLoading}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={() => void handleAnalyze()}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 sm:flex-none sm:min-w-[200px]"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      分析中…
                    </>
                  ) : (
                    `提交 · 生成${RECORD_MODES[recordMode].label}`
                  )}
                </button>
              </div>
              {isLoading && (
                <AiAnalysisPipeline running={isLoading} result={null} />
              )}
            </div>
          )}

          {errorMessage && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      )}

      {analysisSource === "gemma" && status === "success" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <strong>真实模型：</strong>
          本次结果来自 {modelName ?? "Gemma 4"} 多模态分析
          {analysisTimeMs ? `，耗时 ${analysisTimeMs}ms` : ""}。
        </div>
      )}

      {analysisSource === "mock_fallback" && status === "success" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>已自动降级：</strong>
          Gemma 4 接口调用失败，当前结果使用 Mock 数据兜底。
          {fallbackReason ? ` 原因：${fallbackReason}` : ""}
        </div>
      )}

      {analysisSource === "mock" && mockMode && status === "success" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>演示模式：</strong>
          未配置 GEMINI_API_KEY，当前为 Mock 演示数据。
        </div>
      )}

      {savedNotice && status === "success" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          已归档到本机<strong>问题记录</strong>，
          <AnchorLink href="#records" className="font-semibold text-blue-800 underline">
            查看最近上报
          </AnchorLink>
        </div>
      )}

      {result && status === "success" && (
        <div id="tool-results" className="scroll-mt-20 space-y-6">
          <ReportNextSteps
            recordMode={recordMode}
            targetDepartment={targetDepartment}
            exportedMarked={exportedMarked}
          />

          <div className="tool-card p-5 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">诊断结果</h2>
            <p className="mt-1 text-sm text-slate-500">
              {RECORD_MODES[recordMode].label} · AI 结构化输出
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
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 sm:min-w-[140px]"
            >
              {copySuccess ? "已复制 ✓" : `复制${reportTitle}`}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 sm:min-w-[140px]"
            >
              导出 Markdown
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 sm:min-w-[140px]"
            >
              继续记录
            </button>
          </div>

          <details className="rounded-lg border border-slate-200 bg-white">
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
