import type { CloudReport, CloudReportSummary, PhotoAccessRequest } from "@/types/cloudReport";
import {
  sanitizeDiagnosisForPublic,
  toPublicCloudReport,
  toPublicCloudReportSummary,
} from "@/lib/publicReport";
import { fuzzLocationForPublic } from "@/lib/locationValidation";
import { getSupabaseAdmin } from "./admin";

const REPORTS_TABLE = "reports";
const REQUESTS_TABLE = "photo_access_requests";
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

  return ((data ?? []) as CloudReportSummary[]).map(toPublicCloudReportSummary);
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

  if (!data) return null;
  return toPublicCloudReport(data as CloudReport);
}

export async function insertCloudReport(input: {
  localId: string;
  location: string;
  reviewToken: string;
  diagnosis: CloudReport["diagnosis"];
  analysisSource?: string | null;
  imageFile: File;
}): Promise<{ report: CloudReport; reviewToken: string } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const reportId = crypto.randomUUID();
  const extension = input.imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const imagePath = `${reportId}.${extension === "png" ? "png" : "jpg"}`;

  const imageBuffer = Buffer.from(await input.imageFile.arrayBuffer());
  const contentType = extension === "png" ? "image/png" : "image/jpeg";

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

  const fuzzyLocation = fuzzLocationForPublic(input.location);
  const publicDiagnosis = sanitizeDiagnosisForPublic(
    input.diagnosis,
    input.location,
  );
  const diagnosis = input.diagnosis;

  const row = {
    id: reportId,
    local_id: input.localId,
    location: fuzzyLocation,
    lat: null,
    lng: null,
    scene_type: diagnosis.sceneType,
    issue_type: diagnosis.issueType,
    risk_level: diagnosis.riskLevel,
    record_mode: diagnosis.recordMode ?? "public",
    target_department: diagnosis.targetDepartment,
    problem_summary: diagnosis.problemSummary,
    report_text: diagnosis.reportText,
    path_status: diagnosis.pathStatus,
    review_status: diagnosis.reviewStatus ?? "pending",
    image_url: null,
    image_path: imagePath,
    diagnosis: publicDiagnosis,
    analysis_source: input.analysisSource ?? null,
    review_token: input.reviewToken,
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

  return {
    report: toPublicCloudReport(data as CloudReport),
    reviewToken: input.reviewToken,
  };
}

export async function insertPhotoAccessRequest(input: {
  reportId: string;
  message: string;
  contact?: string;
}): Promise<PhotoAccessRequest | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(REQUESTS_TABLE)
    .insert({
      report_id: input.reportId,
      message: input.message.trim(),
      contact: input.contact?.trim() || null,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    console.error("[supabase] insert photo request failed:", error.message);
    return null;
  }

  return data as PhotoAccessRequest;
}

export async function listPhotoAccessRequests(input: {
  reportId: string;
  localId: string;
  reviewToken: string;
}): Promise<PhotoAccessRequest[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data: report, error: reportError } = await supabase
    .from(REPORTS_TABLE)
    .select("local_id, review_token")
    .eq("id", input.reportId)
    .maybeSingle();

  if (reportError || !report) return [];
  if (report.local_id !== input.localId) return [];
  if (report.review_token !== input.reviewToken) return [];

  const { data, error } = await supabase
    .from(REQUESTS_TABLE)
    .select("*")
    .eq("report_id", input.reportId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[supabase] list photo requests failed:", error.message);
    return [];
  }

  return (data ?? []) as PhotoAccessRequest[];
}

export async function updatePhotoAccessRequestStatus(input: {
  reportId: string;
  requestId: string;
  localId: string;
  reviewToken: string;
  status: PhotoAccessRequest["status"];
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data: report } = await supabase
    .from(REPORTS_TABLE)
    .select("local_id, review_token")
    .eq("id", input.reportId)
    .maybeSingle();

  if (!report || report.local_id !== input.localId) return false;
  if (report.review_token !== input.reviewToken) return false;

  const { error } = await supabase
    .from(REQUESTS_TABLE)
    .update({ status: input.status })
    .eq("id", input.requestId)
    .eq("report_id", input.reportId);

  return !error;
}
