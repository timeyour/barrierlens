"use client";

import { REVIEW_STATUS_LABELS, type ReviewStatus } from "@/types/analysis";

const BASE_FLOW: ReviewStatus[] = [
  "pending",
  "exported",
  "reported",
  "review_pending",
];

function buildFlow(status: ReviewStatus): ReviewStatus[] {
  const terminal: ReviewStatus = status === "unfixed" ? "unfixed" : "fixed";
  return [...BASE_FLOW, terminal];
}

function stepState(
  stepIndex: number,
  status: ReviewStatus,
  flow: ReviewStatus[],
): "done" | "current" | "upcoming" {
  const terminalIdx = flow.length - 1;

  if (status === "fixed") {
    return stepIndex <= terminalIdx ? "done" : "upcoming";
  }

  const statusIdx = flow.indexOf(status);
  if (statusIdx < 0) return "upcoming";
  if (stepIndex < statusIdx) return "done";
  if (stepIndex === statusIdx) return "current";
  return "upcoming";
}

interface ReviewStatusFlowProps {
  status: ReviewStatus;
}

export default function ReviewStatusFlow({ status }: ReviewStatusFlowProps) {
  const flow = buildFlow(status);

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        记录状态流转
      </p>
      <ol className="flex items-start justify-between gap-0.5">
        {flow.map((step, index) => {
          const state = stepState(index, status, flow);
          const isTerminal = index === flow.length - 1;
          const isUnfixedTerminal = step === "unfixed" && state === "current";
          const isFixedTerminal = step === "fixed" && status === "fixed";

          let dotClass = "bg-slate-200 text-slate-400";
          let labelClass = "text-slate-400";
          if (state === "done" || isFixedTerminal) {
            dotClass = "bg-emerald-500 text-white";
            labelClass = "text-emerald-700";
          }
          if (state === "current") {
            if (isUnfixedTerminal) {
              dotClass = "bg-red-500 text-white";
              labelClass = "text-red-700 font-semibold";
            } else if (step === "fixed") {
              dotClass = "bg-emerald-600 text-white";
              labelClass = "text-emerald-800 font-semibold";
            } else {
              dotClass = "bg-blue-600 text-white";
              labelClass = "text-blue-700 font-semibold";
            }
          }

          return (
            <li key={`${step}-${index}`} className="relative flex min-w-0 flex-1 flex-col items-center">
              {index > 0 && (
                <span
                  className={`absolute left-0 top-2.5 h-0.5 w-1/2 -translate-x-1/2 ${
                    state === "done" || state === "current" || isFixedTerminal
                      ? "bg-emerald-400"
                      : "bg-slate-200"
                  }`}
                  aria-hidden
                />
              )}
              {index < flow.length - 1 && (
                <span
                  className={`absolute right-0 top-2.5 h-0.5 w-1/2 translate-x-1/2 ${
                    state === "done" || isFixedTerminal ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                  aria-hidden
                />
              )}
              <span
                key={`${status}-${index}`}
                className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold transition-all duration-500 ${dotClass} ${
                  state === "current" ? "scale-110 ring-4 ring-blue-200/60" : ""
                }`}
              >
                {state === "done" || isFixedTerminal ? "✓" : index + 1}
              </span>
              <span
                className={`mt-1 text-center text-[9px] font-medium leading-tight sm:text-[10px] ${labelClass}`}
              >
                {REVIEW_STATUS_LABELS[step]}
                {isTerminal && status === "review_pending" && step === "fixed"
                  ? "（待确认）"
                  : ""}
              </span>
            </li>
          );
        })}
      </ol>
      {status === "unfixed" && (
        <p className="mt-2 rounded-md bg-red-50 px-2 py-1 text-center text-[10px] font-semibold text-red-700">
          复查结论：未整改 — 需继续跟进
        </p>
      )}
      {status === "fixed" && (
        <p className="mt-2 rounded-md bg-emerald-50 px-2 py-1 text-center text-[10px] font-semibold text-emerald-800">
          复查结论：已整改
        </p>
      )}
    </div>
  );
}
