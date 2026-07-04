import {
  SCENE_TYPE_LABELS,
  type LedgerStatus,
  type RecordMode,
  type ReviewStatus,
  type RiskLevel,
  type SceneType,
  type StoredRecord,
} from "@/types/analysis";
import { migrateLegacyReviewStatus } from "@/lib/ledgerStatus";

export type QueueView = "work" | "all" | "history";

export interface RecordFilterState {
  query: string;
  queue: QueueView;
  status: LedgerStatus | "all";
  mode: RecordMode | "all";
  risk: RiskLevel | "all";
  scene: SceneType | "all";
}

export const DEFAULT_RECORD_FILTERS: RecordFilterState = {
  query: "",
  queue: "work",
  status: "all",
  mode: "all",
  risk: "all",
  scene: "all",
};

const WORK_STATUSES: ReviewStatus[] = [
  "pending_verification",
  "pending_remediation",
];

const HISTORY_STATUSES: ReviewStatus[] = ["remediated", "verified"];

function matchesQuery(record: StoredRecord, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    record.id,
    record.location,
    record.issueType,
    record.sceneDescription,
    record.problemSummary,
    record.blockedPath,
    SCENE_TYPE_LABELS[record.sceneType],
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function filterRecords(
  records: StoredRecord[],
  filters: RecordFilterState,
): StoredRecord[] {
  return records.filter((record) => {
    const status = migrateLegacyReviewStatus(record.reviewStatus);
    if (filters.queue === "work" && !WORK_STATUSES.includes(status)) {
      return false;
    }
    if (filters.queue === "history" && !HISTORY_STATUSES.includes(status)) {
      return false;
    }
    if (filters.status !== "all" && status !== filters.status) return false;
    if (filters.mode !== "all" && record.recordMode !== filters.mode) return false;
    if (filters.risk !== "all" && record.riskLevel !== filters.risk) return false;
    if (filters.scene !== "all" && record.sceneType !== filters.scene) return false;
    return matchesQuery(record, filters.query);
  });
}

export function groupRecordsByLocation(
  records: StoredRecord[],
): Array<{ location: string; records: StoredRecord[] }> {
  const map = new Map<string, StoredRecord[]>();
  for (const record of records) {
    const key = record.location?.trim() || "地点未标注";
    const bucket = map.get(key) ?? [];
    bucket.push(record);
    map.set(key, bucket);
  }
  return Array.from(map.entries())
    .map(([location, grouped]) => ({ location, records: grouped }))
    .sort((a, b) => b.records.length - a.records.length);
}

export function countByQueue(records: StoredRecord[]) {
  return {
    work: records.filter((r) =>
      WORK_STATUSES.includes(migrateLegacyReviewStatus(r.reviewStatus)),
    ).length,
    history: records.filter((r) =>
      HISTORY_STATUSES.includes(migrateLegacyReviewStatus(r.reviewStatus)),
    ).length,
    all: records.length,
  };
}
