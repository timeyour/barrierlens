import type { AnalysisSource, StoredRecord } from "@/types/analysis";
import { compressImageForUpload } from "@/lib/imageUtils";
import { getBrowserLocation } from "@/lib/geolocation";

export type CloudSyncResult =
  | { ok: true; id: string; url: string }
  | { ok: false; reason: "not_configured" | "no_image" | "network" | "server" };

export async function syncReportToCloud(input: {
  stored: StoredRecord;
  imageFile: File | null;
  analysisSource?: AnalysisSource | null;
}): Promise<CloudSyncResult> {
  if (!input.imageFile) {
    return { ok: false, reason: "no_image" };
  }

  const coords = await getBrowserLocation();
  const uploadFile = await compressImageForUpload(input.imageFile);

  const formData = new FormData();
  formData.append("image", uploadFile);
  formData.append(
    "payload",
    JSON.stringify({
      localId: input.stored.id,
      location: input.stored.location,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      diagnosis: {
        ...input.stored,
        imageDataUrl: undefined,
        reviewImageDataUrl: undefined,
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
    error?: string;
    code?: string;
  };

  if (response.status === 503 && data.code === "not_configured") {
    return { ok: false, reason: "not_configured" };
  }

  if (!response.ok || !data.id) {
    return { ok: false, reason: "server" };
  }

  return { ok: true, id: data.id, url: `/reports/${data.id}` };
}
