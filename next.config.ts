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
  // 移除standalone模式以避免Vercel部署时的Prisma问题
  // output: 'standalone',
};

export default nextConfig;
