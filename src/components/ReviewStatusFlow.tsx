"use client";

import { LEDGER_STATUS_LABELS, type LedgerStatus } from "@/types/analysis";
import { LEDGER_STATUS_FLOW } from "@/lib/ledgerStatus";
import { ensureGsapPlugins, gsap, useGSAP } from "@/lib/gsapClient";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useRef } from "react";

function stepState(
  stepIndex: number,
  status: LedgerStatus,
): "done" | "current" | "upcoming" {
  const statusIdx = LEDGER_STATUS_FLOW.indexOf(status);
  if (statusIdx < 0) return "upcoming";
  if (stepIndex < statusIdx) return "done";
  if (stepIndex === statusIdx) return "current";
  return "upcoming";
}

interface ReviewStatusFlowProps {
  status: LedgerStatus;
}

ensureGsapPlugins();

export default function ReviewStatusFlow({ status }: ReviewStatusFlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !ref.current) return;
      gsap.fromTo(
        ref.current,
        { scale: 0.98 },
        { scale: 1, duration: 0.45, ease: "power2.out" },
      );
    },
    { scope: ref, dependencies: [status, reducedMotion], revertOnUpdate: true },
  );

  return (
    <div
      ref={ref}
      className="mt-3 rounded-lg border border-slate-200 bg-white p-3"
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        整改台账状态
      </p>
      <ol className="flex items-start justify-between gap-0.5">
        {LEDGER_STATUS_FLOW.map((step, index) => {
          const state = stepState(index, status);
          let dotClass = "bg-slate-200 text-slate-400";
          let labelClass = "text-slate-400";
          if (state === "done") {
            dotClass = "bg-emerald-500 text-white";
            labelClass = "text-emerald-700";
          }
          if (state === "current") {
            dotClass = "bg-blue-600 text-white";
            labelClass = "text-blue-700 font-semibold";
          }

          return (
            <li
              key={step}
              className="relative flex min-w-0 flex-1 flex-col items-center"
            >
              {index > 0 && (
                <span
                  className={`absolute left-0 top-2.5 h-0.5 w-1/2 -translate-x-1/2 ${
                    state === "done" || state === "current"
                      ? "bg-emerald-400"
                      : "bg-slate-200"
                  }`}
                  aria-hidden
                />
              )}
              {index < LEDGER_STATUS_FLOW.length - 1 && (
                <span
                  className={`absolute right-0 top-2.5 h-0.5 w-1/2 translate-x-1/2 ${
                    state === "done" ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                  aria-hidden
                />
              )}
              <span
                className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold transition-all duration-500 ${dotClass}`}
              >
                {state === "done" ? "✓" : index + 1}
              </span>
              <span
                className={`mt-1 text-center text-[9px] font-medium leading-tight sm:text-[10px] ${labelClass}`}
              >
                {LEDGER_STATUS_LABELS[step]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
