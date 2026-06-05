import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

  return Response.json({
    supabaseConfigured: isSupabaseConfigured(),
    hasUrl: url.length > 0,
    hasServiceKey: key.length > 20,
  });
}
