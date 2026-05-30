const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);

export type HackathonFlagKey =
  | "obstacleFallback"
  | "locationRequired"
  | "publicReadOnly"
  | "dispatchScript";

export type HackathonFlags = Record<HackathonFlagKey, boolean>;

const FLAG_ENV: Record<HackathonFlagKey, string> = {
  obstacleFallback: "NEXT_PUBLIC_OBSTACLE_FALLBACK",
  locationRequired: "NEXT_PUBLIC_LOCATION_REQUIRED",
  publicReadOnly: "NEXT_PUBLIC_PUBLIC_READONLY",
  dispatchScript: "NEXT_PUBLIC_DISPATCH_SCRIPT",
};

const FLAG_DEFAULTS: HackathonFlags = {
  obstacleFallback: true,
  locationRequired: true,
  publicReadOnly: true,
  dispatchScript: true,
};

function toBool(raw: string | undefined, defaultValue: boolean): boolean {
  if (!raw) return defaultValue;
  const value = raw.trim().toLowerCase();
  if (TRUE_VALUES.has(value)) return true;
  if (FALSE_VALUES.has(value)) return false;
  return defaultValue;
}

function flagFromEnv(key: HackathonFlagKey): boolean {
  return toBool(process.env[FLAG_ENV[key]], FLAG_DEFAULTS[key]);
}

/** 服务端 / build 时读取单项开关 */
export function isHackathonFlagEnabled(key: HackathonFlagKey): boolean {
  return flagFromEnv(key);
}

/** 服务端读取全部开关（无 URL 覆盖） */
export function getServerHackathonFlags(): HackathonFlags {
  return {
    obstacleFallback: flagFromEnv("obstacleFallback"),
    locationRequired: flagFromEnv("locationRequired"),
    publicReadOnly: flagFromEnv("publicReadOnly"),
    dispatchScript: flagFromEnv("dispatchScript"),
  };
}

function parseUrlFlag(raw: string | undefined): boolean | null {
  if (!raw) return null;
  const value = raw.trim().toLowerCase();
  if (TRUE_VALUES.has(value)) return true;
  if (FALSE_VALUES.has(value)) return false;
  return null;
}

/** ?legacy=1 一键关闭全部新特性；单项 ?obstacleFallback=0 等 */
export function resolveHackathonFlagsFromSearch(
  search?: Partial<Record<string, string | string[] | undefined>>,
): HackathonFlags {
  const first = (key: string): string | undefined => {
    const raw = search?.[key];
    if (Array.isArray(raw)) return raw[0];
    return raw;
  };

  const legacyOff = parseUrlFlag(first("legacy")) === true;

  const resolveOne = (key: HackathonFlagKey): boolean => {
    if (legacyOff) return false;
    const fromUrl = parseUrlFlag(first(key));
    if (fromUrl !== null) return fromUrl;
    return flagFromEnv(key);
  };

  return {
    obstacleFallback: resolveOne("obstacleFallback"),
    locationRequired: resolveOne("locationRequired"),
    publicReadOnly: resolveOne("publicReadOnly"),
    dispatchScript: resolveOne("dispatchScript"),
  };
}

export function hackathonLegacyQuery(): string {
  return "?legacy=1";
}

export function hackathonFlagsRollbackHint(flags: HackathonFlags): string | null {
  const active = (Object.keys(FLAG_DEFAULTS) as HackathonFlagKey[]).filter(
    (key) => flags[key],
  );
  if (active.length === 0) return null;
  return active.join("、");
}
