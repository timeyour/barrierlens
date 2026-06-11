/** 客户端已压到 720px；服务端不再用 sharp，避免 Vercel 函数原生模块崩溃（HTML 500） */
export async function compressBufferForGemma(
  buffer: Buffer,
  _maxWidth: number,
  _quality = 72,
): Promise<string> {
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

export async function prepareUploadImageForGemma(
  buffer: Buffer,
  mimeType: string,
): Promise<{ imageBase64: string; sourceBuffer: Buffer }> {
  return {
    imageBase64: `data:${mimeType};base64,${buffer.toString("base64")}`,
    sourceBuffer: buffer,
  };
}
