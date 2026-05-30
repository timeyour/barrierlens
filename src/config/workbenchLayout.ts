export type WorkbenchLayout = "default" | "compact";

function parseLayout(raw: string | undefined): WorkbenchLayout | null {
  if (!raw) return null;
  const value = raw.trim().toLowerCase();
  if (value === "compact") return "compact";
  if (value === "default" || value === "classic" || value === "full") return "default";
  return null;
}

function layoutFromEnv(): WorkbenchLayout {
  const raw = process.env.NEXT_PUBLIC_WORKBENCH_LAYOUT?.trim().toLowerCase();
  return parseLayout(raw) ?? "default";
}

/** URL ?layout=compact 优先于 env，默认 default（双卡片） */
export function resolveWorkbenchLayout(layoutRaw?: string): WorkbenchLayout {
  const fromUrl = parseLayout(layoutRaw);
  if (fromUrl) return fromUrl;
  return layoutFromEnv();
}

export function workbenchLayoutQuery(layout: WorkbenchLayout): string {
  return layout === "compact" ? "?layout=compact" : "?layout=default";
}
