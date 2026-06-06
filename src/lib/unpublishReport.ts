import { updateRecordReview } from "@/lib/recordStore";
import {
  unpublishReportFromCloud,
  type UnpublishResult,
} from "@/lib/syncReport";
import type { StoredRecord } from "@/types/analysis";

export const UNPUBLISH_CONFIRM_MESSAGE =
  "确认从公开列表撤回本条？本机档案仍保留，之后可再次公开。";

export function unpublishErrorMessage(result: Extract<UnpublishResult, { ok: false }>): string {
  switch (result.reason) {
    case "missing_proof":
      return "无法撤回：缺少公开凭证（请在本机打开原档案）";
    case "not_configured":
      return "云端未配置，无法撤回公开记录";
    case "forbidden":
      return "无权撤回：凭证不匹配";
    case "not_found":
      return "公开记录已不存在（可能已被撤回）";
    case "network":
      return "网络异常，请稍后重试";
    default:
      return "撤回失败，请稍后重试";
  }
}

export async function unpublishStoredRecord(
  record: StoredRecord,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!record.cloudReportId || !record.reviewToken) {
    return { ok: false, message: unpublishErrorMessage({ ok: false, reason: "missing_proof" }) };
  }

  const result = await unpublishReportFromCloud({
    cloudReportId: record.cloudReportId,
    localId: record.id,
    reviewToken: record.reviewToken,
  });

  if (!result.ok) {
    if (result.reason === "not_found") {
      updateRecordReview(record.id, { cloudReportId: null, reviewToken: null });
      return { ok: true };
    }
    return { ok: false, message: unpublishErrorMessage(result) };
  }

  updateRecordReview(record.id, { cloudReportId: null, reviewToken: null });
  return { ok: true };
}
