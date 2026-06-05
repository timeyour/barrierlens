import { getSupabaseBrowserClient, isSupabaseAuthConfigured, storageMode } from "@/lib/supabase/client";
import type { StoredRecord } from "@/types/analysis";

export type RecordSyncResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "not_configured"
        | "not_logged_in"
        | "disabled"
        | "network"
        | "server";
    };

type CloudRecordRow = {
  id: string;
  user_id: string;
  location_text: string;
  issue_type: string;
  risk_level: string;
  affected_groups: string[];
  suggestion: string;
  report_text: string;
  mode: string;
  image_url: string | null;
  status: string;
  created_at: string;
};

function toCloudRow(record: StoredRecord, userId: string): CloudRecordRow {
  return {
    id: record.id,
    user_id: userId,
    location_text: record.location,
    issue_type: record.issueType,
    risk_level: record.riskLevel,
    affected_groups: record.affectedGroups,
    suggestion: record.suggestion,
    report_text: record.reportText,
    mode: record.recordMode,
    image_url: null,
    status: record.reviewStatus,
    created_at: record.recordedAt,
  };
}

/** local-first：本机保存成功后再尝试云端同步；失败不影响主流程 */
export async function syncRecordToCloud(record: StoredRecord): Promise<RecordSyncResult> {
  if (storageMode() !== "local_first") return { ok: false, reason: "disabled" };
  if (!isSupabaseAuthConfigured()) return { ok: false, reason: "not_configured" };

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "not_logged_in" };

  const { error } = await supabase.from("records").upsert(toCloudRow(record, user.id), {
    onConflict: "id",
  });

  if (!error) return { ok: true };
  if (error.message.toLowerCase().includes("network")) {
    return { ok: false, reason: "network" };
  }
  return { ok: false, reason: "server" };
}
