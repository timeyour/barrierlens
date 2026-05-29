"use client";

import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import ImageUploader from "@/components/ImageUploader";
import TargetSelector from "@/components/TargetSelector";
import ModeSelector from "@/components/ModeSelector";
import LocationInput from "@/components/LocationInput";
import ReportResultPanel from "@/components/ReportResultPanel";
import ReportResultLoop from "@/components/ReportResultLoop";
import AiAnalysisPipeline from "@/components/AiAnalysisPipeline";
import GemmaJsonOutput from "@/components/GemmaJsonOutput";
import WizardStepIndicator from "@/components/WizardStepIndicator";
import { downloadMarkdownReport } from "@/lib/exportMarkdown";
import { compressImageForUpload, fileToStoredImageDataUrl } from "@/lib/imageUtils";
import { RecordStorageError, saveRecord, updateRecordReview } from "@/lib/recordStore";
import { scrollToAnchor } from "@/lib/scrollAnchor";
import { getBrowserLocation } from "@/lib/geolocation";
import { syncReportToCloud } from "@/lib/syncReport";
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

/** 让浏览器先绘制 loading，再跑图片压缩等重活 */
function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function SubmitLoadingOverlay({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="absolute inset-0 z-20 flex flex-col justify-center rounded-xl border border-blue-100/80 bg-white/96 px-6 py-8 backdrop-blur-md"
    >
      <div className="mx-auto w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <div className="skeleton-shimmer h-3 w-28 rounded-md" />
          <div className="skeleton-shimmer h-8 w-full rounded-lg" />
          <div className="skeleton-shimmer h-4 w-[80%] rounded-md" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="skeleton-shimmer h-16 w-full rounded-xl" />
          <div className="skeleton-shimmer h-10 w-2/3 max-w-[220px] rounded-lg" />
        </div>
        <p className="pt-2 text-center text-sm font-semibold text-slate-900">
          正在生成{label}
        </p>
        <p className="text-center text-xs leading-relaxed text-slate-500">
          Gemma 4 分析中，约需 15–30 秒，请勿关闭页面
        </p>
      </div>
    </div>
  );
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
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [usedDemoImage, setUsedDemoImage] = useState(false);
  const [cloudReportId, setCloudReportId] = useState<string | null>(null);
  const [cloudSyncNote, setCloudSyncNote] = useState<string | null>(null);

  const clearAnalysisOutput = useCallback(() => {
    setResult(null);
    setAnalysisSource(null);
    setModelName(null);
    setFallbackReason(null);
    setAnalysisTimeMs(null);
    setSavedRecordId(null);
    setStorageWarning(null);
    setCloudReportId(null);
    setCloudSyncNote(null);
  }, []);

  const resetAnalysis = useCallback(() => {
    clearAnalysisOutput();
    setStatus("idle");
  }, [clearAnalysisOutput]);

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

  const persistRecord = async (
    data: AnalysisResult,
    imageFile: File | null,
  ): Promise<StoredRecord> => {
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
    return stored;
  };

  const persistRecordSafe = async (
    data: AnalysisResult,
    imageFile: File | null,
  ): Promise<StoredRecord | null> => {
    try {
      return await persistRecord(data, imageFile);
    } catch (error) {
      if (error instanceof RecordStorageError) {
        setStorageWarning(error.message);
        return null;
      }
      throw error;
    }
  };

  const markRecordExported = useCallback(() => {
    if (!savedRecordId) return;
    updateRecordReview(savedRecordId, { reviewStatus: "exported" });
    setResult((prev) =>
      prev && prev.reviewStatus === "pending"
        ? { ...prev, reviewStatus: "exported" }
        : prev,
    );
  }, [savedRecordId]);

  const markRecordReported = useCallback(() => {
    if (!savedRecordId) return;
    updateRecordReview(savedRecordId, { reviewStatus: "reported" });
    setResult((prev) =>
      prev ? { ...prev, reviewStatus: "reported" } : prev,
    );
  }, [savedRecordId]);

  const beginAnalyzing = useCallback(() => {
    flushSync(() => {
      setErrorMessage(null);
      clearAnalysisOutput();
      setStatus("loading");
    });
  }, [clearAnalysisOutput]);

  const runAnalysis = async (analyzeFile: File) => {
    await waitForPaint();
    scrollToAnchor("#tool-analyzing", "auto");

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

      const stored = await persistRecordSafe(analysis, analyzeFile);
      const coords = await getBrowserLocation();
      const displayResult: AnalysisResult & {
        imageDataUrl?: string;
        lat?: number | null;
        lng?: number | null;
      } = stored
        ? {
            ...stored,
            lat: coords?.lat ?? null,
            lng: coords?.lng ?? null,
          }
        : {
            ...analysis,
            ...(previewUrl && !stored ? { imageDataUrl: previewUrl } : {}),
            lat: coords?.lat ?? null,
            lng: coords?.lng ?? null,
          };

      const resolvedSource =
        responseSource ?? (responseMockMode ? "mock" : "gemma");

      if (stored) {
        const sync = await syncReportToCloud({
          stored,
          imageFile: analyzeFile,
          analysisSource: resolvedSource,
        });
        if (sync.ok) {
          setCloudReportId(sync.id);
          setCloudSyncNote(null);
        } else if (sync.reason === "not_configured") {
          setCloudSyncNote("云端公开列表未配置，记录已保存在本机时间线。");
        } else {
          setCloudSyncNote("云端同步失败，记录已保存在本机，可稍后重试。");
        }
      }

      setResult(displayResult);
      setMockMode(Boolean(responseMockMode));
      setAnalysisSource(resolvedSource);
      setModelName(responseModelName ?? null);
      setFallbackReason(responseFallbackReason ?? null);
      setAnalysisTimeMs(responseAnalysisTimeMs ?? null);
      setStatus("success");
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

  const handleSubmitClick = async () => {
    if (status === "loading") return;

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

    beginAnalyzing();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(12);
    }
    await runAnalysis(analyzeFile);
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
    recordMode === "inspection" ? "巡查整改单" : "公众倡导摘要";

  const analysisNote =
    analysisSource === "gemma"
      ? `本次为真实 Gemma 分析${analysisTimeMs ? `（${analysisTimeMs}ms）` : ""}。`
      : analysisSource === "mock_fallback"
        ? `Gemma 失败已降级 Mock${fallbackReason ? `：${fallbackReason}` : ""}。`
        : analysisSource === "mock"
          ? "当前为 Mock 演示数据。"
          : null;

  return (
    <div className="space-y-6">
      {showWizard && (
        <div className="tool-card p-6 sm:p-10">
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
                  className="btn-secondary w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 disabled:opacity-50"
                >
                  没有照片？使用样例图体验
                </button>
              )}
              {previewUrl && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold"
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
                  className="btn-secondary rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700"
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold"
                >
                  下一步：提交
                </button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div id="tool-analyzing" className="relative space-y-5">
              {isLoading && (
                <SubmitLoadingOverlay label={RECORD_MODES[recordMode].label} />
              )}
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
                  onClick={() => void handleSubmitClick()}
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className={`btn-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold sm:flex-none sm:min-w-[200px] ${
                    isLoading ? "cursor-wait ring-2 ring-blue-200 ring-offset-1" : ""
                  }`}
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

      {storageWarning && status === "success" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          <strong>未能写入本机时间线：</strong>
          {storageWarning}
        </div>
      )}

      {cloudSyncNote && status === "success" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {cloudSyncNote}
        </div>
      )}

      {result && status === "success" && (
        <div id="tool-results" className="scroll-mt-20 space-y-5">
          <div className="tool-card p-5 sm:p-8">
            <ReportResultPanel
              result={result}
              recordMode={recordMode}
              analysisSource={analysisSource}
              reportTitle={reportTitle}
              loopSlot={
                <ReportResultLoop
                  reviewStatus={result.reviewStatus}
                  recordMode={recordMode}
                  copyLabel={
                    copySuccess ? "已复制 ✓" : `复制${reportTitle}`
                  }
                  copySuccess={copySuccess}
                  onCopy={() => void handleCopy()}
                  onExport={handleExport}
                  onMarkReported={markRecordReported}
                  cloudReportId={cloudReportId}
                  analysisNote={analysisNote}
                />
              }
              footerSlot={
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    继续记录
                  </button>
                  <details className="w-full rounded-lg border border-slate-200 bg-white">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-600">
                      Gemma 结构化 JSON（开发者）
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
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
