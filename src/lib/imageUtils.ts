type CompressOptions = {
  maxWidth?: number;
  quality?: number;
};

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
  return new Promise((resolve) => {
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
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: "image/jpeg" });
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
