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

const SHANGHAI_DISTRICTS =
  /浦东新区|黄浦区|徐汇区|长宁区|静安区|普陀区|虹口区|杨浦区|闵行区|宝山区|嘉定区|金山区|松江区|青浦区|奉贤区|崇明区/;

/** 结果页/卡片展示：长地址压成「区 + 路」 */
export function formatLocationBrief(raw: string | undefined | null): string {
  const text = sanitizeLocationForStorage(raw);
  if (!text) return "地点未标注";

  let district = "";
  if (text.includes("浦东新区")) {
    district = "浦东新区";
  } else {
    district =
      text.match(SHANGHAI_DISTRICTS)?.[0] ??
      text.match(/([\u4e00-\u9fa5]{2,4}区)/)?.[1] ??
      "";
  }

  let local = district ? text.replace(district, "") : text;
  local = local
    .replace(/东新区/g, "")
    .replace(/[\u4e00-\u9fa5]{1,6}镇/g, "")
    .replace(/中国[（(][^）)]+[）)]/g, "")
    .replace(/自由贸易试验区[^，,；;]*/g, "")
    .replace(/临港新片区/g, "")
    .replace(/[，,；;\s]+/g, "")
    .trim();

  const road =
    local.match(/([\u4e00-\u9fa5]{2,6}路)/)?.[1] ??
    local.match(/([\u4e00-\u9fa5]{2,6}[街大道])/)?.[1] ??
    "";

  if (district && road) return `${district}${road}`;
  if (road) return road;
  if (district) return district;
  return text.length > 18 ? `${text.slice(0, 18)}…` : text;
}

/** 公开列表用：去掉门牌、机构后缀，只保留区镇 + 路名级别 */
export function fuzzLocationForPublic(raw: string | undefined | null): string {
  const brief = formatLocationBrief(raw);
  if (brief === "地点未标注") return "该路段附近";
  if (brief.endsWith("路") || brief.endsWith("街") || brief.endsWith("道")) {
    return `${brief}附近`.slice(0, 24);
  }
  return `${brief}附近`.slice(0, 24);
}

export function locationValidationHint(raw: string | undefined | null): string | null {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return "请填写路名或地标（至少 6 个字），报告才能对应到具体路段。";
  }
  if (isCoordinatePlaceholder(trimmed)) {
    return "请填写具体路名，GPS 坐标不会写入报告。";
  }
  if (/^[\u4e00-\u9fa5]{2,5}区$/.test(trimmed)) {
    return `仅有「${trimmed}」不够具体，请补充路名，例如「${trimmed}XX路地铁口」。`;
  }
  if (trimmed.length < 6) {
    return "路名过短，请补充到具体路段，例如「XX 路南侧便道」。";
  }
  if (VAGUE_PATTERNS.test(trimmed)) {
    return "请填写真实路名或地标，勿使用「地点未标注」等占位文字。";
  }
  return null;
}
