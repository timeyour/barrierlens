import type { Metadata } from "next";
import { AuthDialogProvider } from "@/components/AuthDialogProvider";
import LocalDevBanner from "@/components/LocalDevBanner";
import { HERO_POSTER, HERO_VIDEO } from "@/config/uiAssets";
import "./globals.css";

export const metadata: Metadata = {
  title: "无碍 BarrierLens · 无障碍通行风险记录",
  description:
    "基于 Gemma 4 多模态理解，将现场照片转化为结构化无障碍通行风险证据，支持归档、复查与导出。",
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
        <link rel="preload" href={HERO_VIDEO.split("#")[0]} as="fetch" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <LocalDevBanner />
        <AuthDialogProvider>{children}</AuthDialogProvider>
      </body>
    </html>
  );
}
