import type { Metadata } from "next";
import { AuthDialogProvider } from "@/components/AuthDialogProvider";
import LocalDevBanner from "@/components/LocalDevBanner";
import { HERO_POSTER } from "@/config/uiAssets";
import "./globals.css";

export const metadata: Metadata = {
  title: "无碍 BarrierLens · Gemma 4 无障碍证据记录",
  description:
    "看见问题不难，留下证据才难。基于 Gemma 4 将现场照片转为结构化证据，支持时间线归档、导出与复查。AI 辅助识别，建议人工复核。",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preload" href={HERO_POSTER} as="image" />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <LocalDevBanner />
        <AuthDialogProvider>{children}</AuthDialogProvider>
        <div id="auth-modal-root" />
      </body>
    </html>
  );
}
