import { getLocationServiceConfig } from "@/lib/locationServiceConfig";
import { reverseGeocodeAddressDetailed } from "@/lib/reverseGeocode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const publicRaw = process.env.NEXT_PUBLIC_AMAP_KEY?.trim() ?? "";
  const serverRaw = process.env.AMAP_WEB_KEY?.trim() ?? "";
  const key = serverRaw || publicRaw;
  const serverKey = key.length >= 16;

  let probe: {
    ok: boolean;
    source: string | null;
    sampleAddress: string | null;
    amapError: string | null;
  } | null = null;

  if (serverKey) {
    const result = await reverseGeocodeAddressDetailed(31.2304, 121.4737);
    probe = {
      ok: Boolean(result.address),
      source: result.source,
      sampleAddress: result.address,
      amapError: result.amapError,
    };
  }

  const emptyPublic = publicRaw.length > 0 && publicRaw.length < 16;
  const emptyServer = serverRaw.length > 0 && serverRaw.length < 16;

  let hint: string | null = null;
  if (!publicRaw && !serverRaw) {
    hint =
      "未配置高德 Key：Vercel Production 需添加 NEXT_PUBLIC_AMAP_KEY（或 AMAP_WEB_KEY），且 .env.local 不能只留空行。未配置时只会填入「当前位置附近路段」。";
  } else if (!serverKey) {
    hint = "Key 过短或为空，请填入完整的高德 Web 服务 Key（通常 32 位）后 Redeploy。";
  } else if (probe && !probe.ok) {
    const serverUnreachable =
      probe.amapError?.startsWith("amap_request_failed") ||
      probe.amapError === "amap_request_timeout";
    hint =
      probe.amapError === "USERKEY_PLAT_NOMATCH"
        ? "Key 已读到，但平台类型不对：控制台需勾选「Web服务」，不能只用「Web端(JS API)」。"
        : probe.amapError === "INVALID_USER_KEY"
          ? "Key 无效或未启用，请在高德控制台核对后 Redeploy。"
          : serverUnreachable && publicRaw.length >= 16
            ? "Vercel 服务端访问高德失败（海外节点常见）。前端「使用当前位置」会走浏览器 JSONP，请在页面内实测；若仍失败，在高德 Key 白名单加入本站域名。"
            : `Key 已配置但服务端逆地理失败（${probe.amapError ?? "unknown"}）。`;
  }

  const clientGeocodeReady = publicRaw.length >= 16;

  return Response.json({
    ...getLocationServiceConfig(),
    amapConfigured: serverKey,
    amapPublicKeySet: publicRaw.length > 0,
    amapPublicKeyValid: publicRaw.length >= 16,
    amapServerKeySet: serverRaw.length > 0,
    amapServerKeyValid: serverRaw.length >= 16,
    emptyPublicKey: emptyPublic,
    emptyServerKey: emptyServer,
    serverReverseGeocodeReady: Boolean(probe?.ok),
    clientGeocodeReady,
    reverseGeocodeReady: Boolean(probe?.ok) || clientGeocodeReady,
    probe,
    hint,
  });
}
