import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 确保构建时注入 NEXT_PUBLIC_AMAP_KEY（Vercel 配好后需 Redeploy）
  env: {
    NEXT_PUBLIC_AMAP_KEY: process.env.NEXT_PUBLIC_AMAP_KEY ?? "",
  },
  async rewrites() {
    return [
      {
        source: "/api/config/location",
        destination: "/api/location/config",
      },
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
