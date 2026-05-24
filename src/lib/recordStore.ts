import type { StoredRecord } from "@/types/analysis";

const STORAGE_KEY = "barrierlens-records";
const MAX_RECORDS = 50;

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

function writeAll(records: StoredRecord[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(records.slice(0, MAX_RECORDS)),
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

export function seedDemoRecordsIfEmpty(): StoredRecord[] {
  const existing = readAll();
  if (existing.length > 0) return getRecords();

  const demos: StoredRecord[] = [
    {
      id: "demo-1",
      issueType: "盲道占用",
      riskLevel: "中",
      affectedGroups: ["视障人士", "老年人"],
      sceneDescription: "地铁口盲道被共享单车连续占用，通行路径中断。",
      suggestion: "建议高峰时段加强巡查与清理。",
      targetDepartment: "城管",
      reportText: "",
      advocacyText: "【公众记录】地铁口盲道占用，需持续关注和记录。",
      inspectionText: "",
      location: "某市地铁 2 号线 A 出入口",
      recordMode: "public",
      recordedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "demo-2",
      issueType: "盲道占用",
      riskLevel: "高",
      affectedGroups: ["视障人士", "轮椅使用者"],
      sceneDescription: "商场主入口盲道被电动车完全阻断。",
      suggestion: "立即清理并设置禁停标识。",
      targetDepartment: "商场",
      reportText: "",
      advocacyText: "",
      inspectionText: "【自查整改单】主入口盲道占用，需 3 日内整改。",
      location: "社区商业综合体北门",
      recordMode: "inspection",
      recordedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "demo-3",
      issueType: "盲道占用",
      riskLevel: "低",
      affectedGroups: ["视障人士"],
      sceneDescription: "小区内部盲道边缘有杂物，主路径仍可通行。",
      suggestion: "纳入日常保洁巡查。",
      targetDepartment: "物业",
      reportText: "",
      advocacyText: "【公众记录】小区盲道边缘占用，建议纳入社区关注。",
      inspectionText: "",
      location: "XX 花园 3 号楼南侧",
      recordMode: "public",
      recordedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
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
