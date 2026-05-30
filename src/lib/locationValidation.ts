const VAGUE_PATTERNS = /地点未标注|未标注|未知位置|测试路段|^测试$/;
const COORD_PLACEHOLDER =
  /^当前位置\s*[（(]\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*[）)]\s*$/;
const RAW_COORD_PAIR = /^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/;

/** GPS 自动填入的坐标占位，不能当作路名写入报告 */
export function isCoordinatePlaceholder(raw: string | undefined | null): boolean {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return false;
  if (COORD_PLACEHOLDER.test(trimmed) || RAW_COORD_PAIR.test(trimmed)) {
    return true;
  }
  return /^当前位置\s*[（(]/.test(trimmed);
}

/** 持久化前去掉坐标占位与模糊占位，只保留真实路名 */
export function sanitizeLocationForStorage(raw: string | undefined | null): string {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed || isCoordinatePlaceholder(trimmed) || VAGUE_PATTERNS.test(trimmed)) {
    return "";
  }
  return trimmed;
}

/** 结果页 / 列表展示用；坐标占位视为未填写 */
export function displayLocationLabel(
  raw: string | undefined | null,
  fallback = "地点未标注",
): string {
  return sanitizeLocationForStorage(raw) || fallback;
}

export function isLocationUsable(raw: string | undefined | null): boolean {
  const trimmed = raw?.trim() ?? "";
  if (trimmed.length < 6) return false;
  if (isCoordinatePlaceholder(trimmed)) return false;
  if (VAGUE_PATTERNS.test(trimmed)) return false;
  return true;
}

export function locationValidationHint(raw: string | undefined | null): string | null {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return "请填写路名或地标（至少 6 个字），报告才能对应到具体路段。";
  }
  if (isCoordinatePlaceholder(trimmed)) {
    return "请填写具体路名，GPS 坐标不会写入报告。";
  }
  if (trimmed.length < 6) {
    return "路名过短，请补充到具体路段，例如「XX 路南侧便道」。";
  }
  if (VAGUE_PATTERNS.test(trimmed)) {
    return "请填写真实路名或地标，勿使用「地点未标注」等占位文字。";
  }
  return null;
}
