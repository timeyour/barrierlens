import type { ReviewStatus } from "@/types/analysis";

/** SeeClickFix 式状态色条 + 徽章样式 */
export const REVIEW_STATUS_BAR: Record<ReviewStatus, string> = {
  pending: "bg-blue-500",
  exported: "bg-amber-500",
  reported: "bg-amber-500",
  review_pending: "bg-violet-500",
  fixed: "bg-emerald-500",
  unfixed: "bg-red-500",
};

export const REVIEW_STATUS_BADGE: Record<ReviewStatus, string> = {
  pending: "bg-blue-50 text-blue-800 ring-blue-200",
  exported: "bg-amber-50 text-amber-900 ring-amber-200",
  reported: "bg-amber-50 text-amber-900 ring-amber-200",
  review_pending: "bg-violet-50 text-violet-800 ring-violet-200",
  fixed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  unfixed: "bg-red-50 text-red-800 ring-red-200",
};
