import type { CloudReport, CloudReportSummary } from "@/types/cloudReport";
import { getSupabaseAdmin } from "./admin";

const REPORTS_TABLE = "reports";
const IMAGE_BUCKET = "report-images";

export async function listCloudReports(
  limit = 30,
): Promise<CloudReportSummary[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(REPORTS_TABLE)
    .select(
      "id, created_at, location, lat, lng, scene_type, issue_type, risk_level, record_mode, problem_summary, image_url, review_status",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[supabase] list reports failed:", error.message);
    return [];
  }

  return (data ?? []) as CloudReportSummary[];
}

export async function getCloudReport(id: string): Promise<CloudReport | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(REPORTS_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[supabase] get report failed:", error.message);
    return null;
  }

  return (data as CloudReport | null) ?? null;
}

export async function insertCloudReport(input: {
  localId: string;
  location: string;
  lat?: number | null;
  lng?: number | null;
  diagnosis: CloudReport["diagnosis"];
  analysisSource?: string | null;
  imageFile: File;
}): Promise<CloudReport | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const reportId = crypto.randomUUID();
  const extension = input.imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const imagePath = `${reportId}.${extension === "png" ? "png" : "jpg"}`;

  const imageBuffer = Buffer.from(await input.imageFile.arrayBuffer());
  const contentType =
    extension === "png" ? "image/png" : "image/jpeg";

  const { error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(imagePath, imageBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    console.error("[supabase] upload image failed:", uploadError.message);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from(IMAGE_BUCKET)
    .getPublicUrl(imagePath);

  const diagnosis = input.diagnosis;

  const row = {
    id: reportId,
    local_id: input.localId,
    location: input.location,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    scene_type: diagnosis.sceneType,
    issue_type: diagnosis.issueType,
    risk_level: diagnosis.riskLevel,
    record_mode: diagnosis.recordMode ?? "public",
    target_department: diagnosis.targetDepartment,
    problem_summary: diagnosis.problemSummary,
    report_text: diagnosis.reportText,
    path_status: diagnosis.pathStatus,
    review_status: diagnosis.reviewStatus ?? "pending",
    image_url: publicUrlData.publicUrl,
    image_path: imagePath,
    diagnosis,
    analysis_source: input.analysisSource ?? null,
  };

  const { data, error } = await supabase
    .from(REPORTS_TABLE)
    .insert(row)
    .select("*")
    .single();

  if (error) {
    console.error("[supabase] insert report failed:", error.message);
    await supabase.storage.from(IMAGE_BUCKET).remove([imagePath]);
    return null;
  }

  return data as CloudReport;
}
