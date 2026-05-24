import type { RiskLevel } from "@/types/analysis";

interface MetricCardProps {
  label: string;
  value: string;
  variant?: "default" | "risk";
  riskLevel?: RiskLevel;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  低: "bg-emerald-50 text-emerald-700 border-emerald-200",
  中: "bg-amber-50 text-amber-700 border-amber-200",
  高: "bg-red-50 text-red-700 border-red-200",
};

export default function MetricCard({
  label,
  value,
  variant = "default",
  riskLevel,
}: MetricCardProps) {
  const riskClass =
    variant === "risk" && riskLevel ? RISK_COLORS[riskLevel] : "";

  return (
    <div
      className={`rounded-xl border p-4 ${
        riskClass || "border-slate-200 bg-white"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}
