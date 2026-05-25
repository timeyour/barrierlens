const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);

function toBool(raw: string | undefined, defaultValue = false): boolean {
  if (!raw) return defaultValue;
  const value = raw.trim().toLowerCase();
  if (TRUE_VALUES.has(value)) return true;
  if (FALSE_VALUES.has(value)) return false;
  return defaultValue;
}

export const FEATURE_FLAGS = {
  v2Enabled: toBool(process.env.NEXT_PUBLIC_V2_ENABLED, true),
  barrierMapEnabled: toBool(process.env.NEXT_PUBLIC_V2_BARRIER_MAP_ENABLED, true),
  reviewFlowEnabled: toBool(process.env.NEXT_PUBLIC_V2_REVIEW_FLOW_ENABLED, true),
} as const;

export type UiMode = "mvp" | "v2";
export type ModeSource = "env" | "url";

function normalizeMode(raw: string | undefined): UiMode | null {
  if (!raw) return null;
  const value = raw.trim().toLowerCase();
  if (value === "mvp") return "mvp";
  if (value === "v2") return "v2";
  return null;
}

export function resolveUiMode(urlModeRaw?: string): {
  mode: UiMode;
  source: ModeSource;
} {
  const urlMode = normalizeMode(urlModeRaw);
  if (urlMode) {
    return { mode: urlMode, source: "url" };
  }

  return {
    mode: FEATURE_FLAGS.v2Enabled ? "v2" : "mvp",
    source: "env",
  };
}

export function getModeLabel(mode: UiMode): string {
  return mode === "v2" ? "V2 风险闭环模式" : "MVP 稳定模式";
}
