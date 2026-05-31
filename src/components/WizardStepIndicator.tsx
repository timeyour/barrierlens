const LABELS = ["现场", "生成"] as const;

function StepCheckIcon() {
  return (
    <svg aria-hidden className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
      <path
        d="M3.5 8.2 6.4 11 12.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface WizardStepIndicatorProps {
  current: 1 | 2;
  flow?: boolean;
}

export default function WizardStepIndicator({ current, flow = false }: WizardStepIndicatorProps) {
  return (
    <nav aria-label="记录步骤" className={`mb-6 flex items-center gap-2 sm:mb-8 ${flow ? "home-flow-steps" : ""}`}>
      {LABELS.map((label, index) => {
        const step = (index + 1) as 1 | 2;
        const active = step === current;
        const done = step < current;
        return (
          <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                flow
                  ? active
                    ? "bg-sky-400 text-slate-950"
                    : done
                      ? "bg-white/15 text-white ring-1 ring-white/25"
                      : "bg-white/5 text-white/45 ring-1 ring-white/10"
                  : active
                    ? "bg-[var(--primary)] text-white shadow-sm shadow-blue-900/15"
                    : done
                      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
                      : "bg-slate-100 text-slate-500"
              }`}
            >
              {done ? <StepCheckIcon /> : step}
            </span>
            <span
              className={`truncate text-sm font-medium ${
                flow
                  ? active
                    ? "text-white"
                    : done
                      ? "text-white/70"
                      : "text-white/40"
                  : active
                    ? "text-slate-900"
                    : "text-slate-500"
              }`}
            >
              {label}
            </span>
            {index < LABELS.length - 1 && (
              <span
                className={`mx-1 hidden h-px flex-1 sm:block ${
                  flow
                    ? done
                      ? "bg-white/30"
                      : "bg-white/10"
                    : done
                      ? "bg-emerald-300/80"
                      : "bg-slate-200"
                }`}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
