import { getReportImagePath } from "@/lib/supabase/reports";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const IMAGE_BUCKET = "report-images";
const SIGNED_URL_TTL_SEC = 60 * 60;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!isSupabaseConfigured()) {
    return new NextResponse(null, { status: 503 });
  }

  const imagePath = await getReportImagePath(id);
  if (!imagePath) {
    return new NextResponse(null, { status: 404 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return new NextResponse(null, { status: 503 });
  }

  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrl(imagePath, SIGNED_URL_TTL_SEC);

  if (error || !data?.signedUrl) {
    console.error("[supabase] signed url failed:", error?.message);
    return new NextResponse(null, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl, {
    status: 302,
    headers: {
      "Cache-Control": "private, max-age=300",
    },
  });
}
