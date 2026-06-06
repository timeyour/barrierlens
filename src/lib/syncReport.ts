import type { AnalysisSource, StoredRecord } from "@/types/analysis";
import { compressImageForUpload } from "@/lib/imageUtils";
import { isLocationUsable } from "@/lib/locationValidation";

export type CloudSyncResult =
  | { ok: true; id: string; url: string; reviewToken: string }
  | {
      ok: false;
      reason:
        | "not_configured"
        | "no_image"
        | "network"
        | "server"
        | "location"
        | "already_published";
    };

/** 用户勾选确认后，才公开到案例池（位置模糊，含现场照片） */
export async function publishReportToCloud(input: {
  stored: StoredRecord;
  imageFile: File | null;
  analysisSource?: AnalysisSource | null;
  requireLocationForCloud?: boolean;
}): Promise<CloudSyncResult> {
  if (input.stored.cloudReportId) {
    return { ok: false, reason: "already_published" };
  }

  if (!input.imageFile) {
    return { ok: false, reason: "no_image" };
  }

  if (
    input.requireLocationForCloud &&
    !isLocationUsable(input.stored.location)
  ) {
    return { ok: false, reason: "location" };
  }

  const uploadFile = await compressImageForUpload(input.imageFile);
  const reviewToken = crypto.randomUUID().replace(/-/g, "");

  const formData = new FormData();
  formData.append("image", uploadFile);
  formData.append(
    "payload",
    JSON.stringify({
      localId: input.stored.id,
      location: input.stored.location,
      reviewToken,
      diagnosis: {
        ...input.stored,
        imageDataUrl: undefined,
        reviewImageDataUrl: undefined,
        cloudReportId: undefined,
        reviewToken: undefined,
      },
      analysisSource: input.analysisSource ?? null,
    }),
  );

  let response: Response;
  try {
    response = await fetch("/api/reports", {
      method: "POST",
      body: formData,
    });
  } catch {
    return { ok: false, reason: "network" };
  }

  const data = (await response.json()) as {
    id?: string;
    url?: string;
    reviewToken?: string;
    error?: string;
    code?: string;
  };

  if (response.status === 503 && data.code === "not_configured") {
    return { ok: false, reason: "not_configured" };
  }

  if (!response.ok || !data.id || !data.reviewToken) {
    return { ok: false, reason: "server" };
  }

  return {
    ok: true,
    id: data.id,
    url: `/reports/${data.id}`,
    reviewToken: data.reviewToken,
  };
}

export type UnpublishResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "not_configured"
        | "missing_proof"
        | "network"
        | "forbidden"
        | "not_found"
        | "server";
    };

/** 记录者凭本机档案凭证撤回公开（本机档案仍保留） */
export async function unpublishReportFromCloud(input: {
  cloudReportId: string;
  localId: string;
  reviewToken: string;
}): Promise<UnpublishResult> {
  if (!input.cloudReportId || !input.localId || !input.reviewToken) {
    return { ok: false, reason: "missing_proof" };
  }

  let response: Response;
  try {
    response = await fetch(`/api/reports/${input.cloudReportId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        localId: input.localId,
        reviewToken: input.reviewToken,
      }),
    });
  } catch {
    return { ok: false, reason: "network" };
  }

  const data = (await response.json()) as { code?: string; error?: string };

  if (response.status === 503 && data.code === "not_configured") {
    return { ok: false, reason: "not_configured" };
  }
  if (response.status === 403) {
    return { ok: false, reason: "forbidden" };
  }
  if (response.status === 404) {
    return { ok: false, reason: "not_found" };
  }
  if (!response.ok) {
    return { ok: false, reason: "server" };
  }

  return { ok: true };
}

/** @deprecated 使用 publishReportToCloud（需用户确认公开） */
export const syncReportToCloud = publishReportToCloud;
