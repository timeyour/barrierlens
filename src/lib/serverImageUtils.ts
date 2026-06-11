import sharp from "sharp";

export async function compressBufferForGemma(
  buffer: Buffer,
  maxWidth: number,
  quality = 72,
): Promise<string> {
  const jpeg = await sharp(buffer)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

/** Vercel 上先压到 720px，保留 sourceBuffer 供 480px 超时重试 */
export async function prepareUploadImageForGemma(
  buffer: Buffer,
  mimeType: string,
): Promise<{ imageBase64: string; sourceBuffer: Buffer }> {
  if (!process.env.VERCEL) {
    return {
      imageBase64: `data:${mimeType};base64,${buffer.toString("base64")}`,
      sourceBuffer: buffer,
    };
  }

  const jpeg = await sharp(buffer)
    .rotate()
    .resize({ width: 720, withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true })
    .toBuffer();
  return {
    imageBase64: `data:image/jpeg;base64,${jpeg.toString("base64")}`,
    sourceBuffer: jpeg,
  };
}
