import type { LedgerStatus, StoredRecord } from "@/types/analysis";
import { LEDGER_STATUS_LABELS } from "@/types/analysis";
import {
  countByLedgerStatus,
  formatLedgerDisplayId,
  migrateLegacyReviewStatus,
} from "@/lib/ledgerStatus";

export interface LedgerReportData {
  projectName: string;
  generatedAt: string;
  totalCount: number;
  highRiskCount: number;
  statusCounts: Record<LedgerStatus, number>;
  items: Array<{
    displayId: string;
    title: string;
    location: string;
    category: string;
    severity: string;
    aiDescription: string;
    suggestion: string;
    status: string;
    createdAt: string;
    reviewResult: string;
  }>;
}

export function buildLedgerReport(records: StoredRecord[]): LedgerReportData {
  const statusCounts = countByLedgerStatus(records);
  const generatedAt = new Date().toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
  });

  return {
    projectName: "BarrierLens 无碍巡检助手 · 整改台账",
    generatedAt,
    totalCount: records.length,
    highRiskCount: records.filter((r) => r.riskLevel === "高").length,
    statusCounts,
    items: records.map((record, index) => {
      const status = migrateLegacyReviewStatus(record.reviewStatus);
      return {
        displayId: formatLedgerDisplayId(record, index),
        title: record.issueType,
        location: record.location,
        category: record.issueType,
        severity: record.riskLevel,
        aiDescription: record.problemSummary,
        suggestion: record.suggestion,
        status: LEDGER_STATUS_LABELS[status],
        createdAt: new Date(record.recordedAt).toLocaleString("zh-CN", {
          timeZone: "Asia/Shanghai",
        }),
        reviewResult: record.reviewNote ?? "—",
      };
    }),
  };
}
