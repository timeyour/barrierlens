const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function toBool(raw: string | undefined): boolean {
  if (!raw) return false;
  return TRUE_VALUES.has(raw.trim().toLowerCase());
}

export const FEATURE_FLAGS = {
  v2Enabled: toBool(process.env.NEXT_PUBLIC_V2_ENABLED),
  barrierMapEnabled: toBool(process.env.NEXT_PUBLIC_V2_BARRIER_MAP_ENABLED),
  reviewFlowEnabled: toBool(process.env.NEXT_PUBLIC_V2_REVIEW_FLOW_ENABLED),
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
