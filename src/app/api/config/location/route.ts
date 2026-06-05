import { getLocationServiceConfig } from "@/lib/locationServiceConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** @deprecated 优先使用 /api/location/config；保留以兼容旧链接 */
export async function GET() {
  try {
    return Response.json(getLocationServiceConfig());
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return Response.json({ error: message }, { status: 500 });
  }
}
