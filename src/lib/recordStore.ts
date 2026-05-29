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

export function seedDemoRecordsIfEmpty(): StoredRecord[] {
  const existing = readAll();
  if (existing.length > 0) return getRecords();

  const demos: StoredRecord[] = [
    {
      id: "demo-1",
      hasIssue: true,
      category: "capacity_demand_mismatch",
      obstacleNature: "dynamic",
      managementAction: "高峰时段保安疏导并增设定点隔离",
      sceneType: "tactile_paving_blocked",
      locationType: "transport_hub",
      obstacles: [
        { name: "共享单车", position: "盲道中心段", blocks: "盲道连续通行路径" },
        { name: "电动车", position: "盲道侧", blocks: "盲道连续通行路径" },
      ],
      blockedPath: "视障人士沿盲道连续通行路径",
      pathStatus: "blocked",
      problemSummary: "盲道连续通行链被占用车辆切断。",
      evidencePoints: ["障碍物位于盲道中心段", "缺少替代导引路径"],
      issueType: "共享单车、电动车占用盲道",
      riskLevel: "中",
      affectedGroups: ["视障人士", "老年人"],
      sceneDescription: "地铁口盲道被共享单车、电动车连续占用，通行路径中断。",
      suggestion: "建议高峰时段加强巡查与清理。",
      responsibleParty: ["城管", "街道运维单位"],
      suggestedActions: ["清理占用车辆", "设置禁停提醒", "增加巡检频次"],
      confidence: 0.82,
      needsHumanReview: true,
      reviewStatus: "pending",
      targetDepartment: "城管",
      reportText: "",
      advocacyText: "【公众记录】地铁口盲道占用，需持续关注和记录。",
      inspectionText: "",
      location: "某市地铁 2 号线 A 出入口",
      recordMode: "public",
      recordedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      imageDataUrl: "/images/scene-blocked-street.png",
    },
    {
      id: "demo-2",
      hasIssue: true,
      category: "legacy_addition_conflict",
      obstacleNature: "dynamic",
      managementAction: "清理入口障碍物并划定临停区",
      sceneType: "accessible_entrance_blocked",
      locationType: "mall",
      obstacles: [
        { name: "电动车", position: "坡道入口前", blocks: "入口净宽" },
      ],
      blockedPath: "轮椅进入建筑的无障碍入口路径",
      pathStatus: "blocked",
      problemSummary: "无障碍入口被占，轮椅和推车难以进入。",
      evidencePoints: ["障碍物紧贴坡道入口", "无替代入口指引"],
      issueType: "无障碍入口受阻",
      riskLevel: "高",
      affectedGroups: ["视障人士", "轮椅使用者"],
      sceneDescription: "商场主入口盲道被电动车完全阻断。",
      suggestion: "立即清理并设置禁停标识。",
      responsibleParty: ["商场运营方", "物业"],
      suggestedActions: ["清理入口障碍物", "补充入口导引标识"],
      confidence: 0.87,
      needsHumanReview: true,
      reviewStatus: "review_pending",
      targetDepartment: "商场",
      reportText: "",
      advocacyText: "",
      inspectionText: "【自查整改单】主入口盲道占用，需 3 日内整改。",
      location: "社区商业综合体北门",
      recordMode: "inspection",
      recordedAt: new Date(Date.now() - 86400000).toISOString(),
      imageDataUrl: "/images/scene-blocked-close.png",
      reviewImageDataUrl: "/images/scene-clear-street.png",
    },
    {
      id: "demo-3",
      hasIssue: true,
      category: "legacy_addition_conflict",
      obstacleNature: "static",
      managementAction: "清理边缘杂物并恢复通道净宽",
      sceneType: "access_route_discontinuity",
      locationType: "community",
      obstacles: [{ name: "杂物堆放", position: "路径边缘", blocks: "通道净宽" }],
      blockedPath: "小区入口到楼栋的连续通行路径",
      pathStatus: "partial",
      problemSummary: "通行链虽可绕行，但连续性不足。",
      evidencePoints: ["路径边缘持续堆放", "绕行空间有限"],
      issueType: "通行链断点",
      riskLevel: "低",
      affectedGroups: ["视障人士"],
      sceneDescription: "小区内部盲道边缘有杂物，主路径仍可通行。",
      suggestion: "纳入日常保洁巡查。",
      responsibleParty: ["物业", "社区"],
      suggestedActions: ["清理边缘杂物", "建立常态巡检"],
      confidence: 0.76,
      needsHumanReview: true,
      reviewStatus: "exported",
      targetDepartment: "物业",
      reportText: "",
      advocacyText: "【公众记录】小区盲道边缘占用，建议纳入社区关注。",
      inspectionText: "",
      location: "XX 花园 3 号楼南侧",
      recordMode: "public",
      recordedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      imageDataUrl: "/images/scene-blocked.png",
    },
  ];

  writeAll(demos);
  return getRecords();
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
