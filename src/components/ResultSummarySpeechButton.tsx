"use client";

import {
  isSpeechSynthesisSupported,
  speakAnalysisSummary,
  stopAnalysisSummarySpeech,
} from "@/lib/analysisSpeech";
import type { AnalysisResult } from "@/types/analysis";
import { useEffect, useState } from "react";

interface ResultSummarySpeechButtonProps {
  result: AnalysisResult;
}

export default function ResultSummarySpeechButton({
  result,
}: ResultSummarySpeechButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => () => stopAnalysisSummarySpeech(), []);

  const handleClick = () => {
    setMessage(null);
    if (!isSpeechSynthesisSupported()) {
      setMessage("当前浏览器不支持语音朗读，请使用系统读屏或自行阅读屏幕摘要。");
      return;
    }

    if (speaking) {
      stopAnalysisSummarySpeech();
      setSpeaking(false);
      return;
    }

    const outcome = speakAnalysisSummary(result, {
      onEnd: () => setSpeaking(false),
      onError: () => {
        setSpeaking(false);
        setMessage("语音朗读中断，请重试。");
      },
    });
    if (!outcome.ok) {
      setMessage(outcome.message);
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          aria-label="朗读结果摘要"
          aria-pressed={speaking}
          className="btn-secondary rounded-lg px-4 py-2 text-sm font-semibold text-slate-800"
        >
          {speaking ? "停止朗读" : "朗读结果摘要"}
        </button>
        <p className="text-[11px] leading-relaxed text-slate-500">
          使用浏览器原生语音，朗读风险等级、问题类型、障碍与整改复查建议。
        </p>
      </div>
      {message && (
        <p className="mt-2 text-xs text-amber-800" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
