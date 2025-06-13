import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 构建时也忽略TypeScript错误
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
