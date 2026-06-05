/** 定位相关环境配置（不含 Key 明文） */
export function getLocationServiceConfig() {
  const publicRaw = process.env.NEXT_PUBLIC_AMAP_KEY?.trim() ?? "";
  const serverRaw = process.env.AMAP_WEB_KEY?.trim() ?? "";

  return {
    publicKeyInBuild: publicRaw.length >= 16,
    serverKeyConfigured: serverRaw.length >= 16,
    clientJsonpReady: publicRaw.length >= 16,
    geocodeApiReady: publicRaw.length >= 16 || serverRaw.length >= 16,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || null,
    locationRequiredDefault:
      process.env.NEXT_PUBLIC_LOCATION_REQUIRED?.trim().toLowerCase() !== "false",
    hints: {
      noPublicKey:
        publicRaw.length < 16
          ? "未配置或未随构建注入 NEXT_PUBLIC_AMAP_KEY：定位将仅尝试 /api/geocode（Vercel 海外可能失败）。请在 Vercel 配置后 Redeploy。"
          : null,
      legacyUrl: "若仅测试流程，可访问 ?legacy=1 放宽必填路名（不推荐正式提交）。",
      healthCheck: "完整探针请访问 /api/health/location",
    },
  };
}
