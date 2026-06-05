/** 首页 Hero 以下各区块共用的内容宽度轨（与顶栏 max-w-6xl 对齐） */
export const HOME_CONTENT_RAIL =
  "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

/** 区块纵向间距 */
export const HOME_SECTION_Y = "py-8 md:py-12 lg:py-14";

/** 与 tool-card 一致的圆角与边框 */
export const HOME_SURFACE_RADIUS = "rounded-[1.25rem]";

export const HOME_SURFACE_CARD =
  `${HOME_SURFACE_RADIUS} border border-slate-200/90 bg-white shadow-[var(--surface-shadow)]`;

export const HOME_SURFACE_CARD_DARK =
  `${HOME_SURFACE_RADIUS} border border-white/10 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.45)]`;

/** 工作台区：与内容轨同宽，卡片铺满可用区域 */
export const HOME_TOOL_RAIL = HOME_CONTENT_RAIL;
