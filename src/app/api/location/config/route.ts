import { getLocationServiceConfig } from "@/lib/locationServiceConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(getLocationServiceConfig());
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return Response.json({ error: message }, { status: 500 });
  }
}
