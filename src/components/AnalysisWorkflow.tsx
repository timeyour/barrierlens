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
import GemmaJsonOutput from "@/components/GemmaJsonOutput";
import WizardStepIndicator from "@/components/WizardStepIndicator";
import { downloadPdfReport } from "@/lib/exportPdf";
import { buildDispatchScript } from "@/lib/dispatchScript";
import { compressImageForUpload, fileFromStoredImage, fileToStoredImageDataUrl } from "@/lib/imageUtils";
import { RecordStorageError, getRecordByLocalId, saveRecord, updateRecordReview } from "@/lib/recordStore";
import { syncRecordToCloud } from "@/lib/recordSync";
import { scrollResultsIntoView, scrollToAnchor } from "@/lib/scrollAnchor";
import {
  dispatchWorkflowPhase,
  resolveWorkflowPhase,
} from "@/lib/workflowPhase";
import { getBrowserLocation } from "@/lib/geolocation";
import PublishSummaryCard, { previewFuzzyLocation } from "@/components/PublishSummaryCard";
import { publishReportToCloud } from "@/lib/syncReport";
import {
  UNPUBLISH_CONFIRM_MESSAGE,
  unpublishStoredRecord,
} from "@/lib/unpublishReport";
import {
  displayLocationLabel,
  isLocationUsable,
  locationValidationHint,
  sanitizeLocationForStorage,
  isCoordinatePlaceholder,
} from "@/lib/locationValidation";
import {
  LOCATION_APPLIED_EVENT,
  PREFILL_LOCATION_EVENT,
  PREFILL_LOCATION_KEY,
  readPrefillLocation,
} from "@/lib/prefillLocation";
import { refillLocationFromCachedCoords } from "@/lib/userLocation";
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
type WizardStep = 1 | 2;

const DEMO_IMAGE_URL = "/images/scene-blocked-close.png";
const DEFAULT_ANALYZE_TIMEOUT_MS = 55_000;
const OLLAMA_ANALYZE_TIMEOUT_MS = 240_000;
const VERCEL_ANALYZE_TIMEOUT_MS = 90_000;

function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

function prefersLocalOllama(): boolean {
  return process.env.NEXT_PUBLIC_OLLAMA_PREFERRED === "true" || isLocalDevHost();
}

function getAnalyzeClientTimeoutMs(): number {
  const fromEnv = Number(process.env.NEXT_PUBLIC_ANALYZE_TIMEOUT_MS);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  if (prefersLocalOllama()) return OLLAMA_ANALYZE_TIMEOUT_MS;
  if (typeof window !== "undefined" && /\.vercel\.app$/i.test(window.location.hostname)) {
    return VERCEL_ANALYZE_TIMEOUT_MS;
  }
  return DEFAULT_ANALYZE_TIMEOUT_MS;
}

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

function SubmitLoadingPanel({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="w-full space-y-5 py-2 md:py-4"
    >
      <div className="space-y-2.5">
        <div className="skeleton-shimmer h-3 w-40 rounded-md sm:w-48" />
        <div className="skeleton-shimmer h-11 w-full rounded-lg" />
        <div className="skeleton-shimmer h-4 w-full rounded-md" />
      </div>
      <div className="space-y-2.5 pt-1">
        <div className="skeleton-shimmer h-24 w-full rounded-xl sm:h-28" />
        <div className="skeleton-shimmer h-11 w-full rounded-lg" />
      </div>
      <p className="pt-1 text-center text-sm font-semibold text-slate-900">
        正在生成{label}
      </p>
      <p className="text-center text-xs leading-relaxed text-slate-500">
        {prefersLocalOllama()
          ? "本机 Ollama 分析中，约需 2–3 分钟，请勿关闭页面"
          : prefersLocalOllama()
            ? "Gemma 4 分析中，约需 15–60 秒，请勿关闭页面"
            : "Gemma 4 分析中（样例图约 2 秒，上传照片约 15–60 秒），请勿关闭页面"}
      </p>
    </div>
  );
}

const PREFILL_KEY = PREFILL_LOCATION_KEY;

function consumePrefillLocation(): string {
  if (typeof window === "undefined") return "";
  let cleaned = "";
  try {
    cleaned = sanitizeLocationForStorage(sessionStorage.getItem(PREFILL_KEY));
    if (cleaned) sessionStorage.removeItem(PREFILL_KEY);
  } catch {
    cleaned = "";
  }
  return cleaned;
}

export default function AnalysisWorkflow({
  compact = false,
  embedded = false,
  flow = false,
  showIntro = false,
}: {
  compact?: boolean;
  embedded?: boolean;
  flow?: boolean;
  showIntro?: boolean;
} = {}) {
  const flags = useHackathonFlags();
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
  const [dispatchCopySuccess, setDispatchCopySuccess] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [usedDemoImage, setUsedDemoImage] = useState(false);
  const [cloudReportId, setCloudReportId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [unpublishing, setUnpublishing] = useState(false);
  const [unpublishError, setUnpublishError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("barrierlens_focus_upload") === "1") {
      sessionStorage.removeItem("barrierlens_focus_upload");
      window.requestAnimationFrame(() => scrollToAnchor("#tool-upload", "smooth"));
    }
  }, []);

  useEffect(() => {
    const applyText = (raw: string) => {
      const prefill = sanitizeLocationForStorage(raw);
      if (!prefill) return;
      setLocation(prefill);
    };
    const syncPrefill = () => applyText(readPrefillLocation());
    const onApplied = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (typeof detail === "string") applyText(detail);
    };
    syncPrefill();
    window.addEventListener(PREFILL_LOCATION_EVENT, syncPrefill);
    window.addEventListener(LOCATION_APPLIED_EVENT, onApplied);
    return () => {
      window.removeEventListener(PREFILL_LOCATION_EVENT, syncPrefill);
      window.removeEventListener(LOCATION_APPLIED_EVENT, onApplied);
    };
  }, []);

  useEffect(() => {
    if (readPrefillLocation()) return;
    let cancelled = false;
    void refillLocationFromCachedCoords().then((text) => {
      if (cancelled || !text) return;
      setLocation(text);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (wizardStep !== 2) return;
    const prefill = consumePrefillLocation();
    if (!prefill) return;
    const rafId = window.requestAnimationFrame(() => setLocation(prefill));
    return () => window.cancelAnimationFrame(rafId);
  }, [wizardStep]);

  const clearAnalysisOutput = useCallback(() => {
    setResult(null);
    setAnalysisSource(null);
    setModelName(null);
    setFallbackReason(null);
    setAnalysisTimeMs(null);
    setSavedRecordId(null);
    setStorageWarning(null);
    setCloudReportId(null);
    setPublishError(null);
    setPublishing(false);
    setUnpublishError(null);
    setUnpublishing(false);
    setExportError(null);
    setExporting(false);
    setShowAdvancedOptions(false);
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
      const stored = await persistRecord(data, imageFile, coords);
      void syncRecordToCloud(stored).then((synced) => {
        if (
          !synced.ok &&
          synced.reason !== "not_logged_in" &&
          synced.reason !== "disabled" &&
          synced.reason !== "not_configured"
        ) {
          setStorageWarning("云端同步失败，本机记录已保存。");
        }
      });
      return stored;
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

  const handlePublishSummary = async () => {
    if (!savedRecordId) {
      setPublishError("无法公开：本机档案未保存，请重新分析或清理浏览器旧记录后重试");
      return;
    }
    const stored = getRecordByLocalId(savedRecordId);
    if (!stored) {
      setPublishError("本机档案未找到，请重新分析");
      return;
    }

    let imageFile = file;
    if (!imageFile) {
      imageFile = await fileFromStoredImage(stored);
    }
    if (!imageFile) {
      setPublishError("无法公开：缺少现场照片，请重新上传并分析");
      return;
    }

    setPublishing(true);
    setPublishError(null);
    try {
      const publish = await publishReportToCloud({
        stored,
        imageFile,
        analysisSource,
        requireLocationForCloud: flags.locationRequired,
      });

      if (publish.ok) {
        updateRecordReview(savedRecordId, {
          cloudReportId: publish.id,
          reviewToken: publish.reviewToken,
        });
        setCloudReportId(publish.id);
        return;
      }

      if (publish.reason === "location") {
        setPublishError("路名未通过校验，请填写具体路段后再公开");
      } else if (publish.reason === "not_configured") {
        setPublishError(
          "云端未配置，无法公开摘要（本机档案仍可用）。请确认 Vercel 已设置 NEXT_PUBLIC_SUPABASE_URL 与 SUPABASE_SERVICE_ROLE_KEY 并重新部署。",
        );
      } else if (publish.reason === "already_published") {
        setCloudReportId(stored.cloudReportId ?? null);
        setPublishError("该记录已公开");
      } else if (publish.reason === "server") {
        setPublishError("云端保存失败，请稍后重试或检查 Supabase 项目是否正常");
      } else {
        setPublishError("公开失败，请稍后重试");
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublishSummary = async () => {
    if (!savedRecordId) return;
    const stored = getRecordByLocalId(savedRecordId);
    if (!stored?.cloudReportId) {
      setUnpublishError("该记录未公开");
      return;
    }
    if (!window.confirm(UNPUBLISH_CONFIRM_MESSAGE)) return;

    setUnpublishing(true);
    setUnpublishError(null);
    try {
      const result = await unpublishStoredRecord(stored);
      if (result.ok) {
        setCloudReportId(null);
        return;
      }
      setUnpublishError(result.message);
    } finally {
      setUnpublishing(false);
    }
  };

  useEffect(() => {
    dispatchWorkflowPhase(
      resolveWorkflowPhase({ status, wizardStep }),
    );
  }, [status, wizardStep]);

  useEffect(() => {
    if (status !== "success" || !result) return;
    const scroll = () => scrollResultsIntoView("#tool-results", "smooth");
    scroll();
    const timer1 = window.setTimeout(scroll, 120);
    const timer2 = window.setTimeout(scroll, 350);
    if (window.location.hash !== "#tool-results") {
      window.history.replaceState(null, "", "#tool-results");
    }
    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
    };
  }, [status, result]);

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
    let uploadFile: File;
    try {
      uploadFile = await compressImageForUpload(analyzeFile);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "图片处理失败，请换 JPG/PNG 后重试",
      );
    }
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
            : response.status >= 500 && rawText.includes("__next_error__")
              ? "服务器内部错误（路由崩溃）。请刷新后先点「使用样例图」；若仍失败，请确认 Vercel 未配置 GEMMA_API_PROXY。"
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

      setResult(displayResult);
      setMockMode(Boolean(responseMockMode));
      setAnalysisSource(resolvedSource);
      setModelName(responseModelName ?? null);
      setFallbackReason(responseFallbackReason ?? null);
      setAnalysisTimeMs(responseAnalysisTimeMs ?? null);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      if (error instanceof Error && error.name === "AbortError") {
        setErrorMessage(
          prefersLocalOllama()
            ? `分析超时（已等待 ${Math.round(getAnalyzeClientTimeoutMs() / 1000)} 秒）。请确认 Ollama App 在运行且已拉取 gemma4 模型，或稍后再试。`
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

  const handleExport = async () => {
    if (!result) return;
    setExportError(null);
    setExporting(true);
    try {
      const imageDataUrl =
        "imageDataUrl" in result && typeof result.imageDataUrl === "string"
          ? result.imageDataUrl
          : previewUrl ?? undefined;
      await downloadPdfReport(result, {
        mode: recordMode,
        imageDataUrl,
      });
      markRecordExported();
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "PDF 导出失败，请稍后重试",
      );
    } finally {
      setExporting(false);
    }
  };

  const isLoading = status === "loading";
  const showWizard = status !== "success";
  const locationReady = !flags.locationRequired || isLocationUsable(location);
  const reportTitle =
    recordMode === "inspection" ? "巡查整改单" : "公众倡导摘要";

  const analysisNote =
    analysisSource === "gemma"
      ? `analysisSource=gemma · 模型 ${modelName ?? "gemma-4-26b-a4b-it"} · 真实 Gemma 4 多模态识图${analysisTimeMs ? `（${analysisTimeMs}ms）` : ""}`
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
      ? "p-0"
      : "";
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
            <div id="tool-upload" className="scroll-mt-24 w-full space-y-5 md:space-y-6">
              {showIntro && !flow && (
                <div>
                  <h2 className="text-base font-bold text-slate-900 md:text-lg">
                    在哪？拍一张
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    选现场照片并填写路名，然后继续。
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <p className={`text-sm font-medium ${flow ? "text-white/75" : "text-slate-700"}`}>
                  现场照片
                </p>
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
                    aria-label="使用样例图"
                    className={
                      flow
                        ? "flow-btn-secondary w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
                        : "btn-secondary w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 disabled:opacity-50"
                    }
                  >
                    使用样例图
                  </button>
                )}
              </div>

              <LocationInput
                value={location}
                onChange={(value) =>
                  setLocation(isCoordinatePlaceholder(value) ? "" : value)
                }
                disabled={isLoading}
                required={flags.locationRequired}
                flow={flow}
              />

              <div className="flex flex-col items-end gap-2 pt-1">
                {!previewUrl && (
                  <p className="w-full text-right text-xs text-slate-500" role="status">
                    请先上传现场照片
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  disabled={!previewUrl || !locationReady}
                  aria-label="继续"
                  title={
                    !previewUrl
                      ? "请先选择照片"
                      : !locationReady
                        ? (locationValidationHint(location) ?? undefined)
                        : undefined
                  }
                  className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  继续
                </button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div
              id="tool-analyzing"
              className="relative w-full min-h-[min(320px,48vh)] space-y-5 md:space-y-6"
            >
              {isLoading ? (
                <SubmitLoadingPanel label={RECORD_MODES[recordMode].label} />
              ) : (
                <>
              <h3 className={stepTitleClass}>确认并生成</h3>

              {previewUrl && (
                <div className={previewBoxClass}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-md border border-slate-200 bg-slate-900 object-contain"
                  />
                  <div className={`min-w-0 flex-1 text-xs ${mutedTextClass}`}>
                    {usedDemoImage ? "样例图" : "现场照片"} ·{" "}
                    {displayLocationLabel(location)}
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className={`ml-2 font-semibold underline ${flow ? "text-sky-300" : "text-blue-600"}`}
                    >
                      修改
                    </button>
                  </div>
                </div>
              )}

              {!locationReady && (
                <LocationInput
                  value={location}
                  onChange={(value) =>
                    setLocation(isCoordinatePlaceholder(value) ? "" : value)
                  }
                  disabled={isLoading}
                  required={flags.locationRequired}
                  flow={flow}
                />
              )}

              {showAdvancedOptions ? (
                <div className="space-y-5">
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
                  <button
                    type="button"
                    onClick={() => setShowAdvancedOptions(false)}
                    className={`text-xs font-semibold underline ${
                      flow ? "text-white/50" : "text-slate-500"
                    }`}
                  >
                    收起选项
                  </button>
                </div>
              ) : (
                <div
                  className={
                    flow
                      ? "rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                      : "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  }
                >
                  <p>
                    默认{" "}
                    <span className="font-semibold">{RECORD_MODES[recordMode].label}</span>
                    {" · "}
                    <span className="font-semibold">{targetDepartment}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedOptions(true)}
                    className={`mt-2 text-xs font-semibold underline ${
                      flow ? "text-sky-300" : "text-blue-700"
                    }`}
                  >
                    更多选项
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  disabled={isLoading}
                  className={
                    flow
                      ? "flow-btn-secondary rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                      : "btn-secondary rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  }
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmitClick()}
                  disabled={isLoading || !locationReady}
                  aria-busy={isLoading}
                  aria-label="生成分析"
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
                    "生成报告"
                  )}
                </button>
              </div>
                </>
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

      {result && status === "success" && (
        <div
          id="tool-results"
          className="scroll-mt-24 space-y-4 md:min-h-[calc(100dvh-9rem)]"
        >
          {previewUrl && (
            <div className={previewBoxClass}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                className="h-16 w-16 shrink-0 rounded-md border border-slate-200 bg-slate-900 object-contain"
              />
              <div className={`min-w-0 flex-1 text-xs ${mutedTextClass}`}>
                <p className={`font-semibold ${flow ? "text-white" : "text-slate-800"}`}>
                  报告已生成
                </p>
                <p className="mt-0.5">
                  {usedDemoImage ? "样例图" : "现场照片"} ·{" "}
                  {displayLocationLabel(location)}
                </p>
              </div>
            </div>
          )}

          <ReportResultPanel
              result={result}
              recordMode={recordMode}
              analysisSource={analysisSource}
              modelName={modelName}
              reportTitle={reportTitle}
              topBarSlot={
                <div className="sticky top-0 z-10 -mx-1 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 pb-3 pt-0 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={handleReset}
                    className={
                      flow
                        ? "flow-btn-secondary rounded-lg px-4 py-2 text-sm font-semibold"
                        : "btn-secondary rounded-lg px-4 py-2 text-sm font-semibold text-slate-800"
                    }
                  >
                    ← 继续记录
                  </button>
                  {savedRecordId && (
                    <Link
                      href={`/saved/${savedRecordId}`}
                      aria-label="保存记录，查看本机档案"
                      className={
                        flow
                          ? "rounded-lg px-3 py-2 text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white"
                          : "rounded-lg px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 hover:text-blue-900"
                      }
                    >
                      查看档案
                    </Link>
                  )}
                </div>
              }
              loopSlot={
                <ReportResultLoop
                  reviewStatus={result.reviewStatus}
                  recordMode={recordMode}
                  copyLabel={
                    copySuccess ? "已复制 ✓" : `复制${reportTitle}`
                  }
                  copySuccess={copySuccess}
                  onCopy={() => void handleCopy()}
                  onExport={() => void handleExport()}
                  onMarkReported={markRecordReported}
                  analysisNote={analysisNote}
                  dispatchScriptEnabled={flags.dispatchScript}
                  dispatchCopySuccess={dispatchCopySuccess}
                  onCopyDispatch={() => void handleCopyDispatch()}
                  exportError={exportError}
                  exporting={exporting}
                />
              }
              publishSlot={
                result ? (
                  <PublishSummaryCard
                    fuzzyLocationPreview={previewFuzzyLocation(result.location)}
                    publishing={publishing}
                    publishedId={cloudReportId}
                    publishError={publishError}
                    onPublish={handlePublishSummary}
                    unpublishing={unpublishing}
                    unpublishError={unpublishError}
                    onUnpublish={handleUnpublishSummary}
                    archiveReady={Boolean(savedRecordId)}
                  />
                ) : null
              }
              footerSlot={
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className={
                        flow
                          ? "flow-btn-secondary rounded-lg px-4 py-2 text-sm font-semibold"
                          : "btn-secondary rounded-lg px-4 py-2 text-sm font-semibold text-slate-800"
                      }
                    >
                      继续记录
                    </button>
                    {savedRecordId && (
                      <Link
                        href={`/saved/${savedRecordId}`}
                        aria-label="保存记录，查看本机档案"
                        className={
                          flow
                            ? "flow-btn-secondary rounded-lg px-4 py-2 text-sm font-semibold"
                            : "btn-secondary rounded-lg px-4 py-2 text-sm font-semibold text-slate-800"
                        }
                      >
                        查看档案
                      </Link>
                    )}
                  </div>
                  <details
                  className={
                    flow
                      ? "rounded-lg border border-white/10 bg-white/[0.03]"
                      : "rounded-xl border border-slate-200 bg-white"
                  }
                >
                  <summary
                    className={`cursor-pointer px-4 py-3 text-sm font-medium ${
                      flow ? "text-white/60" : "text-slate-500"
                    }`}
                  >
                    开发者 · Gemma JSON
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
      )}
    </div>
  );
}
