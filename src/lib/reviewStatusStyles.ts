import type { LedgerStatus } from "@/types/analysis";

export const REVIEW_STATUS_BAR: Record<LedgerStatus, string> = {
  pending_verification: "bg-blue-500",
  pending_remediation: "bg-amber-500",
  remediated: "bg-emerald-500",
  verified: "bg-violet-500",
};

export const REVIEW_STATUS_BADGE: Record<LedgerStatus, string> = {
  pending_verification: "bg-blue-50 text-blue-800 ring-blue-200",
  pending_remediation: "bg-amber-50 text-amber-900 ring-amber-200",
  remediated: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  verified: "bg-violet-50 text-violet-800 ring-violet-200",
};
