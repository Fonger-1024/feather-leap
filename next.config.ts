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
  // 优化静态生成
  experimental: {
    optimizePackageImports: ['@prisma/client'],
  },
  // 确保API路由不被静态化
  output: 'standalone',
};

export default nextConfig;
