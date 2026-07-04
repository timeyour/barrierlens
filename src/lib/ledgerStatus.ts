import type { LedgerStatus, ReviewStatus, StoredRecord } from "@/types/analysis";

export const LEDGER_STATUS_FLOW: LedgerStatus[] = [
  "pending_verification",
  "pending_remediation",
  "remediated",
  "verified",
];

const LEGACY_STATUS_MAP: Record<string, LedgerStatus> = {
  pending: "pending_verification",
  exported: "pending_verification",
  reported: "pending_remediation",
  review_pending: "pending_remediation",
  fixed: "remediated",
  unfixed: "pending_remediation",
};

export function migrateLegacyReviewStatus(raw: string | undefined): LedgerStatus {
  if (!raw) return "pending_verification";
  if (LEDGER_STATUS_FLOW.includes(raw as LedgerStatus)) {
    return raw as LedgerStatus;
  }
  return LEGACY_STATUS_MAP[raw] ?? "pending_verification";
}

export function migrateStoredRecord(record: StoredRecord): StoredRecord {
  return {
    ...record,
    reviewStatus: migrateLegacyReviewStatus(record.reviewStatus),
  };
}

export function formatLedgerDisplayId(record: StoredRecord, index = 0): string {
  const match = record.id.match(/^demo-ledger-(\d+)$/i);
  if (match) {
    return `BL-DEMO-${match[1].padStart(2, "0")}`;
  }
  const year = new Date(record.recordedAt).getFullYear();
  const suffix = record.id.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `BL-${year}-${suffix || String(index + 1).padStart(3, "0")}`;
}

export function countByLedgerStatus(records: StoredRecord[]) {
  const counts: Record<LedgerStatus, number> = {
    pending_verification: 0,
    pending_remediation: 0,
    remediated: 0,
    verified: 0,
  };
  for (const record of records) {
    const status = migrateLegacyReviewStatus(record.reviewStatus);
    counts[status] += 1;
  }
  return counts;
}

export function isDemoLedgerRecord(record: StoredRecord): boolean {
  return record.id.startsWith("demo-ledger-");
}

export const DEMO_LEDGER_ID_PREFIX = "demo-ledger-";

/** @deprecated use LedgerStatus */
export type { ReviewStatus };
