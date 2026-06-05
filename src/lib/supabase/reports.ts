import type { CloudReport, CloudReportSummary, PhotoAccessRequest } from "@/types/cloudReport";
import {
  sanitizeDiagnosisForPublic,
  toPublicCloudReport,
  toPublicCloudReportSummary,
} from "@/lib/publicReport";
import { fuzzLocationForPublic } from "@/lib/locationValidation";
import { publicReportPhotoPath, withPublicPhotoUrl } from "@/lib/reportImage";
import { getSupabaseAdmin } from "./admin";

type ReportDbRow = CloudReport & { image_path?: string | null };

const REPORTS_TABLE = "reports";
const REQUESTS_TABLE = "photo_access_requests";
const IMAGE_BUCKET = "report-images";
const REPORT_PUBLIC_FIELDS =
  "id, created_at, local_id, location, lat, lng, scene_type, issue_type, risk_level, record_mode, target_department, problem_summary, report_text, path_status, review_status, image_url, image_path, diagnosis, analysis_source";

const REPORT_LIST_FIELDS =
  "id, created_at, location, lat, lng, scene_type, issue_type, risk_level, record_mode, problem_summary, image_url, image_path, review_status";

export async function listCloudReports(
  limit = 30,
): Promise<CloudReportSummary[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(REPORTS_TABLE)
    .select(REPORT_LIST_FIELDS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[supabase] list reports failed:", error.message);
    return [];
  }

  return ((data ?? []) as ReportDbRow[])
    .map((row) => withPublicPhotoUrl(row))
    .map((row) => toPublicCloudReportSummary(row as CloudReportSummary));
}

export async function getReportImagePath(reportId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(REPORTS_TABLE)
    .select("image_path")
    .eq("id", reportId)
    .maybeSingle();

  if (error || !data?.image_path) return null;
  return data.image_path as string;
}

export async function getCloudReport(id: string): Promise<CloudReport | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(REPORTS_TABLE)
    .select(REPORT_PUBLIC_FIELDS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[supabase] get report failed:", error.message);
    return null;
  }

  if (!data) return null;
  const enriched = withPublicPhotoUrl(data as ReportDbRow);
  return toPublicCloudReport(enriched as CloudReport);
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
    image_url: publicReportPhotoPath(reportId),
    image_path: imagePath,
    diagnosis: publicDiagnosis,
    analysis_source: input.analysisSource ?? null,
    review_token: input.reviewToken,
  };

  const { data, error } = await supabase
    .from(REPORTS_TABLE)
    .insert(row)
    .select(REPORT_PUBLIC_FIELDS)
    .single();

  if (error) {
    console.error("[supabase] insert report failed:", error.message);
    await supabase.storage.from(IMAGE_BUCKET).remove([imagePath]);
    return null;
  }

  const enriched = withPublicPhotoUrl(data as ReportDbRow);
  return {
    report: toPublicCloudReport(enriched as CloudReport),
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
