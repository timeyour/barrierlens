import { checkSupabaseCloudHealth } from "@/lib/supabase/health";

export const runtime = "nodejs";

export async function GET() {
  const health = await checkSupabaseCloudHealth();
  return Response.json(health, { status: health.ok ? 200 : 503 });
}
