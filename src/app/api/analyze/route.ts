import { analyzeImage } from "@/lib/gemma";
import { NextResponse } from "next/server";
import type { RecordMode, TargetDepartment } from "@/types/analysis";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const targetDepartment = formData.get("targetDepartment") as TargetDepartment;
    const recordMode = (formData.get("recordMode") as RecordMode) || "public";
    const location = (formData.get("location") as string) || undefined;

    if (!image || !targetDepartment) {
      return NextResponse.json(
        { error: "缺少图片或场景归类" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const mimeType = image.type || "image/jpeg";
    const imageBase64 = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const result = await analyzeImage({
      imageBase64,
      targetDepartment,
      recordMode,
      location,
      fileName: image.name,
    });

    return NextResponse.json({
      ...result,
      mockMode: !process.env.GEMMA_API_KEY,
    });
  } catch (error) {
    console.error("Analysis failed:", error);
    return NextResponse.json({ error: "分析失败，请稍后重试" }, { status: 500 });
  }
}
