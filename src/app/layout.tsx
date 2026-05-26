import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HERO_POSTER, HERO_VIDEO } from "@/config/uiAssets";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preload" href={HERO_POSTER} as="image" />
        <link rel="preload" href={HERO_VIDEO.split("#")[0]} as="fetch" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
