"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
import { buildDispatchScript } from "@/lib/dispatchScript";
import { compressImageForUpload, fileToStoredImageDataUrl } from "@/lib/imageUtils";
import { RecordStorageError, saveRecord, updateRecordReview } from "@/lib/recordStore";
import { scrollToAnchor } from "@/lib/scrollAnchor";
import { getBrowserLocation } from "@/lib/geolocation";
import { syncReportToCloud } from "@/lib/syncReport";
import { isLocationUsable, locationValidationHint, sanitizeLocationForStorage } from "@/lib/locationValidation";
import { useHackathonFlags } from "@/hooks/useHackathonFlags";
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
const DEFAULT_ANALYZE_TIMEOUT_MS = 55_000;
const OLLAMA_ANALYZE_TIMEOUT_MS = 180_000;

function getAnalyzeClientTimeoutMs(): number {
  const fromEnv = Number(process.env.NEXT_PUBLIC_ANALYZE_TIMEOUT_MS);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  if (process.env.NEXT_PUBLIC_OLLAMA_PREFERRED === "true") return OLLAMA_ANALYZE_TIMEOUT_MS;
  return DEFAULT_ANALYZE_TIMEOUT_MS;
}

const LOCAL_OLLAMA_HINT = process.env.NEXT_PUBLIC_OLLAMA_PREFERRED === "true";

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
          {LOCAL_OLLAMA_HINT
            ? "本机 Ollama 分析中，约需 2–3 分钟，请勿关闭页面"
            : "Gemma 4 分析中，约需 15–30 秒，请勿关闭页面"}
        </p>
      </div>
    </div>
  );
}

function readPrefillLocation(): string {
  if (typeof window === "undefined") return "";
  const prefill = sessionStorage.getItem("barrierlens_prefill_location");
  const cleanedPrefill = sanitizeLocationForStorage(prefill);
  if (cleanedPrefill) {
    sessionStorage.removeItem("barrierlens_prefill_location");
    return cleanedPrefill;
  }
  if (prefill) {
    sessionStorage.removeItem("barrierlens_prefill_location");
  }
  return "";
}

export default function AnalysisWorkflow({
  compact = false,
  embedded = false,
  flow = false,
}: {
  compact?: boolean;
  embedded?: boolean;
  flow?: boolean;
} = {}) {
  const flags = useHackathonFlags();
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetDepartment, setTargetDepartment] =
    useState<TargetDepartment>("物业");
  const [recordMode, setRecordMode] = useState<RecordMode>("public");
  const [location, setLocation] = useState(readPrefillLocation);
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [mockMode, setMockMode] = useState(false);
  const [analysisSource, setAnalysisSource] = useState<AnalysisSource | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [analysisTimeMs, setAnalysisTimeMs] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [dispatchCopySuccess, setDispatchCopySuccess] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [usedDemoImage, setUsedDemoImage] = useState(false);
  const [cloudReportId, setCloudReportId] = useState<string | null>(null);
  const [cloudSyncNote, setCloudSyncNote] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("barrierlens_focus_upload") === "1") {
      sessionStorage.removeItem("barrierlens_focus_upload");
      window.requestAnimationFrame(() => scrollToAnchor("#tool-upload", "smooth"));
    }
  }, []);

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
    coords?: { lat: number; lng: number } | null,
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
    const trimmedLocation = sanitizeLocationForStorage(location);
    const resolvedLocation = flags.locationRequired
      ? trimmedLocation
      : trimmedLocation || sanitizeLocationForStorage(data.location) || "地点未标注";
    const stored: StoredRecord = {
      ...data,
      id,
      location: resolvedLocation,
      recordMode: data.recordMode ?? recordMode,
      targetDepartment: data.targetDepartment ?? targetDepartment,
      reviewStatus: data.reviewStatus ?? "pending",
      recordedAt: data.recordedAt ?? new Date().toISOString(),
      imageDataUrl,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    };
    saveRecord(stored);
    setSavedRecordId(id);
    return stored;
  };

  const persistRecordSafe = async (
    data: AnalysisResult,
    imageFile: File | null,
    coords?: { lat: number; lng: number } | null,
  ): Promise<StoredRecord | null> => {
    try {
      return await persistRecord(data, imageFile, coords);
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
    const trimmedLocation = sanitizeLocationForStorage(location);
    if (trimmedLocation) formData.append("location", trimmedLocation);
    else if (!flags.locationRequired) formData.append("location", "地点未标注");

    try {
      const controller = new AbortController();
      const clientTimeoutMs = getAnalyzeClientTimeoutMs();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        clientTimeoutMs,
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

      const coords = await getBrowserLocation();
      const stored = await persistRecordSafe(analysis, analyzeFile, coords);
      const displayResult: AnalysisResult & {
        imageDataUrl?: string;
        lat?: number | null;
        lng?: number | null;
      } = stored
        ? {
            ...stored,
            lat: stored.lat ?? coords?.lat ?? null,
            lng: stored.lng ?? coords?.lng ?? null,
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
          requireLocationForCloud: flags.locationRequired,
        });
        if (sync.ok) {
          setCloudReportId(sync.id);
          setCloudSyncNote(null);
        } else if (sync.reason === "location") {
          setCloudSyncNote(
            "路名未通过校验，记录已保存在本机；填写具体路段后可再次上报同步公开池。",
          );
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
        setErrorMessage(
          LOCAL_OLLAMA_HINT
            ? `分析超时（已等待 ${Math.round(getAnalyzeClientTimeoutMs() / 1000)} 秒）。请确认 Ollama App 在运行，或稍后再试。`
            : "分析超时，请使用样例图或稍后重试",
        );
        return;
      }
      setErrorMessage(
        error instanceof Error ? error.message : "分析失败，请稍后重试",
      );
    }
  };

  const handleSubmitClick = async () => {
    if (status === "loading") return;

    if (flags.locationRequired && !isLocationUsable(location)) {
      setErrorMessage(
        locationValidationHint(location) ?? "请先填写具体路名或地标。",
      );
      return;
    }

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

  const handleCopyDispatch = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(
        buildDispatchScript(
          {
            ...result,
            location:
              sanitizeLocationForStorage(result.location) ||
              sanitizeLocationForStorage(location),
          },
          recordMode,
        ),
      );
      setDispatchCopySuccess(true);
      markRecordExported();
      setTimeout(() => setDispatchCopySuccess(false), 2000);
    } catch {
      setErrorMessage("复制话术失败，请手动选择文本复制");
    }
  };

  const handleExport = () => {
    if (!result) return;
    downloadMarkdownReport(result, undefined, recordMode);
    markRecordExported();
  };

  const isLoading = status === "loading";
  const showWizard = status !== "success";
  const locationReady = !flags.locationRequired || isLocationUsable(location);
  const reportTitle =
    recordMode === "inspection" ? "巡查整改单" : "公众倡导摘要";

  const analysisNote =
    analysisSource === "gemma"
      ? `本次为真实 Gemma 分析${analysisTimeMs ? `（${analysisTimeMs}ms）` : ""}。`
      : analysisSource === "ollama"
        ? `本次为本地 Ollama · ${modelName ?? "gemma4"}${analysisTimeMs ? `（${analysisTimeMs}ms）` : ""}。`
      : analysisSource === "mock_fallback"
        ? `Gemma 失败已降级 Mock${fallbackReason ? `：${fallbackReason}` : ""}。`
        : analysisSource === "mock"
          ? "当前为 Mock 演示数据。"
          : null;

  const wizardShellClass = flow
    ? "p-0"
    : embedded
      ? "tool-card p-6 sm:p-10 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none"
      : "tool-card p-6 sm:p-10";
  const stepTitleClass = flow ? "text-base font-bold text-white" : "text-base font-bold text-slate-900";
  const mutedTextClass = flow ? "text-white/50" : "text-slate-600";
  const previewBoxClass = flow
    ? "flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2"
    : "flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2";
  const uploadVariant = compact ? "compact" : "hero";

  return (
    <div className="space-y-6">
      {showWizard && (
        <div className={`${wizardShellClass}${compact && embedded ? " md:pt-2" : ""}`}>
          <WizardStepIndicator current={wizardStep} flow={flow} />

          {wizardStep === 1 && (
            <div id="tool-upload" className="scroll-mt-24 space-y-3 md:space-y-4">
              <h3 className="sr-only">上传照片</h3>
              <ImageUploader
                variant={uploadVariant}
                previewUrl={previewUrl}
                onImageSelect={handleImageSelect}
                onClear={handleClearImage}
                disabled={isLoading}
                flow={flow}
              />
              {!previewUrl && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => void loadDemoImage()}
                  className={
                    flow
                      ? "flow-btn-secondary w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
                      : "btn-secondary w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 disabled:opacity-50"
                  }
                >
                  使用样例图
                </button>
              )}
              {previewUrl && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold"
                  >
                    下一步
                  </button>
                </div>
              )}
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-5">
              <h3 className={stepTitleClass}>类型</h3>
              {previewUrl && (
                <div className={previewBoxClass}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-14 w-14 rounded-md object-cover"
                  />
                  <div className={`min-w-0 flex-1 text-xs ${mutedTextClass}`}>
                    {usedDemoImage ? "样例图已选" : "现场照片已选"}
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className={`ml-2 font-semibold underline ${flow ? "text-sky-300" : "text-blue-600"}`}
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
                flow={flow}
              />
              <TargetSelector
                value={targetDepartment}
                onChange={setTargetDepartment}
                disabled={isLoading}
                flow={flow}
              />
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className={
                    flow
                      ? "flow-btn-secondary rounded-xl px-5 py-2.5 text-sm font-semibold"
                      : "btn-secondary rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700"
                  }
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold"
                >
                  下一步
                </button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div id="tool-analyzing" className="relative space-y-5">
              {isLoading && (
                <SubmitLoadingOverlay label={RECORD_MODES[recordMode].label} />
              )}
              <h3 className={stepTitleClass}>确认</h3>
              <LocationInput
                value={location}
                onChange={setLocation}
                disabled={isLoading}
                required={flags.locationRequired}
                flow={flow}
              />
              <div
                className={
                  flow
                    ? "rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                    : "rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                }
              >
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
                  className={
                    flow
                      ? "flow-btn-secondary rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                      : "rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  }
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmitClick()}
                  disabled={isLoading || !locationReady}
                  aria-busy={isLoading}
                  title={
                    !locationReady
                      ? (locationValidationHint(location) ?? undefined)
                      : undefined
                  }
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
                    `生成报告`
                  )}
                </button>
              </div>
              {isLoading && (
                <AiAnalysisPipeline running={isLoading} result={null} />
              )}
            </div>
          )}

          {errorMessage && (
            <p className={`mt-4 text-sm ${flow ? "text-red-300" : "text-red-600"}`} role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      )}

      {storageWarning && status === "success" && (
        <div
          className={
            flow
              ? "rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
              : "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          }
          role="alert"
        >
          <strong>未能写入本机时间线：</strong>
          {storageWarning}
        </div>
      )}

      {cloudSyncNote && status === "success" && (
        <div
          className={
            flow
              ? "rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
              : "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          }
        >
          {cloudSyncNote}
        </div>
      )}

      {result && status === "success" && (
        <div id="tool-results" className="scroll-mt-20 space-y-5">
          <div className={flow ? "flow-panel p-5 sm:p-8" : "tool-card p-5 sm:p-8"}>
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
                  dispatchScriptEnabled={flags.dispatchScript}
                  dispatchCopySuccess={dispatchCopySuccess}
                  onCopyDispatch={() => void handleCopyDispatch()}
                  savedRecordId={savedRecordId}
                />
              }
              footerSlot={
                <div className="flex flex-wrap gap-2">
                  {savedRecordId && (
                    <Link
                      href={`/saved/${savedRecordId}`}
                      className="btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold"
                    >
                      查看保存档案
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    className={
                      flow
                        ? "flow-btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold"
                        : "btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700"
                    }
                  >
                    继续记录
                  </button>
                  <details
                    className={
                      flow
                        ? "w-full rounded-lg border border-white/10 bg-white/[0.03]"
                        : "w-full rounded-lg border border-slate-200 bg-white"
                    }
                  >
                    <summary
                      className={`cursor-pointer px-4 py-3 text-sm font-medium ${
                        flow ? "text-white/60" : "text-slate-600"
                      }`}
                    >
                      Gemma 结构化 JSON（开发者）
                    </summary>
                    <div
                      className={`border-t p-3 pt-0 ${flow ? "border-white/10" : "border-slate-200"}`}
                    >
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
