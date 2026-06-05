import type { AnalysisResult } from "@/types/analysis";

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

function formatObstacles(result: AnalysisResult): string {
  if (result.obstacles.length > 0) {
    return result.obstacles
      .map((item, index) => {
        const parts = [item.name, item.position, item.blocks].filter(Boolean);
        return `${index + 1}、${parts.join("，")}`;
      })
      .join("；");
  }
  if (result.blockedPath.trim()) return result.blockedPath.trim();
  if (result.problemSummary.trim()) return result.problemSummary.trim();
  return "未单独列出";
}

function formatRemediation(result: AnalysisResult): string {
  const parts = [
    ...result.suggestedActions.filter(Boolean),
    result.suggestion.trim(),
    result.managementAction.trim(),
  ].filter(Boolean);
  const unique = [...new Set(parts)];
  return unique.length > 0 ? unique.join("；") : "请对照现场照片人工核对";
}

function formatReviewAdvice(result: AnalysisResult): string {
  const reviewHints = result.suggestedActions.filter((action) =>
    /复查|复拍|复核|跟进|整改后|验收/.test(action),
  );
  if (reviewHints.length > 0) return reviewHints.join("；");
  if (result.recordMode === "inspection") {
    return "请在整改完成后复拍对照，并更新复查状态";
  }
  return "建议整改后复拍对照，并在时间线更新复查状态";
}

export function buildAnalysisSummarySpeech(result: AnalysisResult): string {
  const affected =
    result.affectedGroups.length > 0
      ? result.affectedGroups.join("、")
      : "未标注";

  return [
    "无碍 BarrierLens 分析结果摘要。",
    `风险等级：${result.riskLevel}。`,
    `问题类型：${result.issueType}。`,
    `影响人群：${affected}。`,
    `主要障碍：${formatObstacles(result)}。`,
    `整改建议：${formatRemediation(result)}。`,
    `复查建议：${formatReviewAdvice(result)}。`,
  ].join("");
}

function pickChineseVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang === "zh-CN") ??
    voices.find((voice) => voice.lang.startsWith("zh")) ??
    null
  );
}

export type SpeakAnalysisResult =
  | { ok: true }
  | { ok: false; message: string };

export function speakAnalysisSummary(
  result: AnalysisResult,
  handlers?: { onEnd?: () => void; onError?: () => void },
): SpeakAnalysisResult {
  if (!isSpeechSynthesisSupported()) {
    return {
      ok: false,
      message: "当前浏览器不支持语音朗读，请使用系统读屏或自行阅读屏幕摘要。",
    };
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(buildAnalysisSummarySpeech(result));
  utterance.lang = "zh-CN";
  const voice = pickChineseVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 0.95;
  if (handlers?.onEnd) utterance.onend = handlers.onEnd;
  if (handlers?.onError) utterance.onerror = handlers.onError;

  try {
    window.speechSynthesis.speak(utterance);
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "语音朗读启动失败，请稍后重试或使用读屏软件。",
    };
  }
}

export function stopAnalysisSummarySpeech(): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
}
