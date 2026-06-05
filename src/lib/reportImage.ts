/** 公开记录现场照片的同源代理（Storage 私有，经服务端签发短期链接） */
export function publicReportPhotoPath(reportId: string): string {
  return `/api/reports/${reportId}/photo`;
}

export function hasPublicReportPhoto(row: {
  image_path?: string | null;
  image_url?: string | null;
}): boolean {
  return Boolean(row.image_path?.trim() || row.image_url?.trim());
}

export function withPublicPhotoUrl<T extends { id: string; image_url: string | null; image_path?: string | null }>(
  row: T,
): T {
  if (!hasPublicReportPhoto(row)) {
    return { ...row, image_url: null };
  }
  return { ...row, image_url: publicReportPhotoPath(row.id) };
}
