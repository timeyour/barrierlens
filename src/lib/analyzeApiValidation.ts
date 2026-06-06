import {
  isLocationUsable,
  locationValidationHint,
  sanitizeLocationForStorage,
} from "@/lib/locationValidation";
import { withCors } from "@/lib/teamApiAuth";
import {
  RECORD_MODES,
  TARGET_DEPARTMENTS,
  type RecordMode,
  type TargetDepartment,
} from "@/types/analysis";
import { NextResponse } from "next/server";

export const ANALYZE_API_LIMITS = {
  maxImageBytes: 8 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  locationMaxLen: 120,
} as const;

export type AnalyzeApiErrorCode =
  | "INVALID_REQUEST"
  | "IMAGE_TOO_LARGE"
  | "IMAGE_UNSUPPORTED"
  | "LOCATION_INVALID"
  | "INTERNAL_ERROR";

export type AnalyzeApiErrorBody = {
  error: string;
  code: AnalyzeApiErrorCode;
};

export function analyzeApiErrorResponse(
  request: Request,
  status: number,
  code: AnalyzeApiErrorCode,
  message: string,
): Response {
  return withCors(
    request,
    NextResponse.json({ error: message, code } satisfies AnalyzeApiErrorBody, {
      status,
    }),
  );
}

function normalizeMimeType(file: File): string {
  const type = file.type?.toLowerCase() ?? "";
  if (type.startsWith("image/")) return type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return type;
}

export function validateAnalyzeImage(
  image: FormDataEntryValue | null,
): { ok: true; file: File; mimeType: string } | { ok: false; code: AnalyzeApiErrorCode; message: string } {
  if (!image || typeof image === "string") {
    return { ok: false, code: "INVALID_REQUEST", message: "缺少现场照片" };
  }

  if (!(image instanceof File) || image.size <= 0) {
    return { ok: false, code: "INVALID_REQUEST", message: "图片无效或为空" };
  }

  if (image.size > ANALYZE_API_LIMITS.maxImageBytes) {
    return {
      ok: false,
      code: "IMAGE_TOO_LARGE",
      message: "图片过大，请换一张较小的照片或使用样例图",
    };
  }

  const mimeType = normalizeMimeType(image);
  if (
    !ANALYZE_API_LIMITS.allowedMimeTypes.includes(
      mimeType as (typeof ANALYZE_API_LIMITS.allowedMimeTypes)[number],
    )
  ) {
    return {
      ok: false,
      code: "IMAGE_UNSUPPORTED",
      message: "仅支持 JPG、PNG、WEBP 格式",
    };
  }

  return { ok: true, file: image, mimeType };
}

export function parseTargetDepartment(
  raw: FormDataEntryValue | null,
): TargetDepartment | null {
  if (typeof raw !== "string") return null;
  return TARGET_DEPARTMENTS.includes(raw as TargetDepartment)
    ? (raw as TargetDepartment)
    : null;
}

export function parseRecordMode(raw: FormDataEntryValue | null): RecordMode | null {
  if (raw === null || raw === "") return "public";
  if (typeof raw !== "string") return null;
  return raw in RECORD_MODES ? (raw as RecordMode) : null;
}

export function resolveAnalyzeLocation(input: {
  locationRaw: FormDataEntryValue | null;
  locationRequired: boolean;
}):
  | { ok: true; location?: string }
  | { ok: false; code: AnalyzeApiErrorCode; message: string } {
  const raw =
    typeof input.locationRaw === "string" ? input.locationRaw.trim() : "";

  if (raw.length > ANALYZE_API_LIMITS.locationMaxLen) {
    return {
      ok: false,
      code: "LOCATION_INVALID",
      message: `路名过长，请控制在 ${ANALYZE_API_LIMITS.locationMaxLen} 字以内`,
    };
  }

  const location = sanitizeLocationForStorage(raw) || undefined;

  if (input.locationRequired) {
    if (!location || !isLocationUsable(location)) {
      return {
        ok: false,
        code: "LOCATION_INVALID",
        message:
          locationValidationHint(raw || location) ??
          "请填写具体路名或地标（至少 6 个字）",
      };
    }
    return { ok: true, location };
  }

  if (raw && location && !isLocationUsable(location)) {
    return {
      ok: false,
      code: "LOCATION_INVALID",
      message: locationValidationHint(location) ?? "路名格式不正确",
    };
  }

  return { ok: true, location };
}
