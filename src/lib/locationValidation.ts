/** 逆地理失败时的输入框占位，不算真实路名 */
export const AUTO_FALLBACK_ADDRESS = "当前位置附近路段";

const VAGUE_PATTERNS = /地点未标注|未标注|未知位置|测试路段|^测试$/;
const CLOUD_VAGUE_PATTERNS = /当前位置附近路段|该路段附近/;
const LOCATION_ANCHOR =
  /省|市|区|县|镇|乡|街道|路|街|大道|弄|号|地铁|站|口|广场|公园|医院|学校|小区|商场|公司|门口/;

function hasLocationAnchor(raw: string): boolean {
  return LOCATION_ANCHOR.test(raw);
}

export function isAutoFallbackLocation(raw: string | undefined | null): boolean {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return false;
  return trimmed === AUTO_FALLBACK_ADDRESS || CLOUD_VAGUE_PATTERNS.test(trimmed);
}
const COORD_PLACEHOLDER =
  /^当前位置\s*[（(]\s*-?\d+\.?\d*\s*[,，]\s*-?\d+\.?\d*\s*[）)]\s*$/;
const RAW_COORD_PAIR = /^-?\d+(\.\d+)?\s*[,，]\s*-?\d+(\.\d+)?$/;

/** 是否像经纬度/坐标文本（含多种常见写法） */
export function isCoordinatePlaceholder(raw: string | undefined | null): boolean {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return false;
  if (COORD_PLACEHOLDER.test(trimmed) || RAW_COORD_PAIR.test(trimmed)) {
    return true;
  }
  if (/^(?:经度|纬度|坐标|lng|lat)\s*[:：]?\s*-?\d/i.test(trimmed)) return true;
  if (/^-?\d{1,3}\.\d+\s*[,，]\s*-?\d{1,3}\.\d+$/.test(trimmed)) return true;
  if (/^-?\d{1,3}\.\d+\s+\-?\d{1,3}\.\d+$/.test(trimmed)) return true;
  if (/^当前位置\s*[（(]/.test(trimmed)) return true;
  // 纯数字坐标段，无中文
  if (!/[\u4e00-\u9fa5]/.test(trimmed) && /^-?\d[\d.,，\s-]+$/.test(trimmed)) {
    return true;
  }
  return false;
}

/** 自动填入/存储用：必须是中文地址，拒绝坐标 */
export function isChineseAddressText(raw: string | undefined | null): boolean {
  const trimmed = sanitizeLocationForStorage(raw);
  if (!trimmed) return false;
  return /[\u4e00-\u9fa5]{2,}/.test(trimmed);
}

/** 定位成功后写入输入框的地址（坐标或未解析成功则返回 null） */
export function locationTextForAutoFill(raw: string | undefined | null): string | null {
  const trimmed = sanitizeLocationForStorage(raw);
  if (!trimmed || !isChineseAddressText(trimmed)) return null;
  return trimmed;
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
  if (trimmed.length < 4) return false;
  if (isCoordinatePlaceholder(trimmed)) return false;
  if (VAGUE_PATTERNS.test(trimmed)) return false;
  if (isAutoFallbackLocation(trimmed)) return false;
  return true;
}

/** 云端公开用：在可用基础上要求更具体，拒绝兜底占位文本 */
export function isLocationSpecificForCloud(raw: string | undefined | null): boolean {
  const trimmed = sanitizeLocationForStorage(raw);
  if (!isLocationUsable(trimmed)) return false;
  if (CLOUD_VAGUE_PATTERNS.test(trimmed)) return false;
  if (!hasLocationAnchor(trimmed)) return false;
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
  if (!hasLocationAnchor(brief)) return "该路段附近";
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
    return "检测到坐标格式，请填写中文地址：省市 + 区 + 镇/街道 + 路名。";
  }
  if (/^[\u4e00-\u9fa5]{2,5}区$/.test(trimmed)) {
    return `仅有「${trimmed}」不够具体，请补充路名，例如「${trimmed}XX路地铁口」。`;
  }
  if (isAutoFallbackLocation(trimmed)) {
    return "尚未解析到具体路名，请稍候或手动填写，例如「浦东新区芳甸路」。";
  }
  if (trimmed.length < 6) {
    return "路名过短，请补充到具体路段，例如「XX 路南侧便道」。";
  }
  if (VAGUE_PATTERNS.test(trimmed)) {
    return "请填写真实路名或地标，勿使用「地点未标注」等占位文字。";
  }
  if (!hasLocationAnchor(trimmed)) {
    return "看起来不像具体地址，请补充区/街道/路名或地标，例如「浦东新区芳甸路」。";
  }
  return null;
}
