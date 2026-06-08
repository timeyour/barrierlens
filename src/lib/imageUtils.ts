type CompressOptions = {
  maxWidth?: number;
  quality?: number;
};

const ACCEPTED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
]);

export function isAcceptableImageFile(file: File): boolean {
  const type = file.type?.toLowerCase() ?? "";
  if (type.startsWith("image/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext ? ACCEPTED_IMAGE_EXTENSIONS.has(ext) : false;
}

export function imageFileRejectReason(file: File): string | null {
  if (isAcceptableImageFile(file)) return null;
  return "不支持该格式，请使用 JPG、PNG 或 WEBP（iPhone 照片可在「预览」中导出为 JPEG）";
}

export const IMAGE_FILE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}

async function compressDataUrl(
  dataUrl: string,
  { maxWidth = 960, quality = 0.82 }: CompressOptions = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () =>
      reject(
        new Error(
          "浏览器无法读取该照片，请换 JPG/PNG，或在「预览」中导出为 JPEG 后再上传",
        ),
      );
    img.src = dataUrl;
  });
}

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: "image/jpeg" });
}

export { dataUrlToFile };

async function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("读取照片失败"));
    reader.readAsDataURL(blob);
  });
}

/** PDF / 公开用：blob 预览地址转为 data URL，避免 html2canvas 失败 */
export async function resolveImageDataUrlForExport(
  candidate?: string | null,
): Promise<string | undefined> {
  if (!candidate) return undefined;
  if (candidate.startsWith("data:")) return candidate;
  if (candidate.startsWith("blob:")) {
    const response = await fetch(candidate);
    return readBlobAsDataUrl(await response.blob());
  }
  return candidate;
}

/** 公开时本机 File 丢失，从档案缩略图恢复 */
export async function fileFromStoredImage(
  stored: { id: string; imageDataUrl?: string },
): Promise<File | null> {
  if (!stored.imageDataUrl?.startsWith("data:")) return null;
  return dataUrlToFile(stored.imageDataUrl, `barrierlens-${stored.id.slice(0, 8)}.jpg`);
}

/** 压缩后存入 localStorage（缩略图，约 480px） */
export async function fileToStoredImageDataUrl(file: File): Promise<string> {
  const raw = await readFileAsDataUrl(file);
  return compressDataUrl(raw, { maxWidth: 480, quality: 0.55 });
}

/** 上传 API 前压缩：保留更多细节供视觉识别 */
export async function compressImageForUpload(file: File): Promise<File> {
  const raw = await readFileAsDataUrl(file);
  const compressed = await compressDataUrl(raw, { maxWidth: 1280, quality: 0.78 });
  const baseName = file.name.replace(/\.[^.]+$/i, "") || "upload";
  return dataUrlToFile(compressed, `${baseName}.jpg`);
}
