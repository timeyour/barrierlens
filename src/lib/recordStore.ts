import type { ReviewStatus, StoredRecord } from "@/types/analysis";

const STORAGE_KEY = "barrierlens-records";
/** 含缩略图时 localStorage 约 5MB 上限，条数不宜过多 */
const MAX_RECORDS = 25;

export class RecordStorageError extends Error {
  code: "quota" | "unknown";

  constructor(message: string, code: "quota" | "unknown" = "quota") {
    super(message);
    this.name = "RecordStorageError";
    this.code = code;
  }
}

function isQuotaError(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false;
  return (
    error.name === "QuotaExceededError" ||
    error.code === 22 ||
    error.code === 1014
  );
}

function readAll(): StoredRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function stripImages(record: StoredRecord): StoredRecord {
  const next = { ...record };
  delete next.imageDataUrl;
  delete next.reviewImageDataUrl;
  return next;
}

function compactionPasses(records: StoredRecord[]): StoredRecord[][] {
  const capped = records.slice(0, MAX_RECORDS);
  return [
    capped,
    capped.map((r, i) => (i >= 8 ? stripImages(r) : r)),
    capped.map((r, i) => (i >= 3 ? stripImages(r) : r)),
    capped.slice(0, 15).map((r, i) => (i >= 1 ? stripImages(r) : r)),
    capped.slice(0, 10).map(stripImages),
    capped.slice(0, 5),
  ];
}

function writeAll(records: StoredRecord[]): void {
  const attempts = compactionPasses(records);

  for (let i = 0; i < attempts.length; i += 1) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts[i]));
      window.dispatchEvent(new Event("barrierlens-record-saved"));
      return;
    } catch (error) {
      if (!isQuotaError(error) && i === 0) {
        throw new RecordStorageError("无法写入本机记录", "unknown");
      }
    }
  }

  throw new RecordStorageError(
    "本机存储空间已满（localStorage 约 5MB）。请在「最近上报」中删除旧记录，或使用浏览器清除本站数据后重试。诊断结果仍可复制/导出。",
    "quota",
  );
}

export function getRecords(): StoredRecord[] {
  return readAll().sort(
    (a, b) =>
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
}

export function getRecordByLocalId(id: string): StoredRecord | null {
  return readAll().find((record) => record.id === id) ?? null;
}

export function saveRecord(record: StoredRecord): void {
  const existing = readAll();
  writeAll([record, ...existing.filter((r) => r.id !== record.id)]);
}

export function deleteRecord(id: string): boolean {
  const next = readAll().filter((r) => r.id !== id);
  if (next.length === readAll().length) return false;
  writeAll(next);
  return true;
}

export function clearAllRecords(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("barrierlens-record-saved"));
}

export function updateRecordReview(
  id: string,
  patch: {
    reviewStatus?: ReviewStatus;
    reviewNote?: string;
    reviewedAt?: string;
    reviewImageDataUrl?: string | null;
  },
): StoredRecord | null {
  const records = readAll();
  const idx = records.findIndex((record) => record.id === id);
  if (idx < 0) return null;

  const current = records[idx];
  const touched =
    patch.reviewStatus !== undefined ||
    patch.reviewNote !== undefined ||
    patch.reviewImageDataUrl !== undefined;

  const next: StoredRecord = {
    ...current,
    ...(patch.reviewStatus !== undefined
      ? { reviewStatus: patch.reviewStatus }
      : {}),
    ...(patch.reviewNote !== undefined ? { reviewNote: patch.reviewNote } : {}),
    ...(patch.reviewImageDataUrl !== undefined
      ? {
          reviewImageDataUrl:
            patch.reviewImageDataUrl === null
              ? undefined
              : patch.reviewImageDataUrl,
        }
      : {}),
    reviewedAt: patch.reviewedAt ?? (touched ? new Date().toISOString() : current.reviewedAt),
  };
  records[idx] = next;
  writeAll(records);
  return next;
}

const DEMO_RECORD_ID_PREFIX = "demo-";

/** 清除历史注入的演示时间线数据（id 以 demo- 开头） */
export function purgeDemoRecords(): number {
  const existing = readAll();
  const next = existing.filter((record) => !record.id.startsWith(DEMO_RECORD_ID_PREFIX));
  if (next.length === existing.length) return 0;
  writeAll(next);
  return existing.length - next.length;
}

export function formatRecordTime(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
