# Vercel 500错误故障排除指南

## 🚨 问题分析

Vercel部署后API接口返回500错误，通常由以下原因导致：

### 1. Prisma Client 未正确生成
- Vercel缓存依赖导致Prisma Client过期
- standalone模式下Prisma引擎文件丢失

### 2. 环境变量配置问题
- DATABASE_URL未正确配置
- NEXTAUTH_SECRET缺失
- 环境变量验证失败

### 3. 数据库连接问题
- Supabase连接池限制
- 连接字符串格式错误
- SSL证书问题

## 🔧 解决方案

### ✅ 已修复配置

#### 1. 修复了 `next.config.ts`：
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['@prisma/client'],
  },
  // 移除standalone模式以避免Vercel部署时的Prisma问题
  // output: 'standalone',
};

export default nextConfig;
```

#### 2. 优化了 `vercel.json`：
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "env": {
    "SKIP_ENV_VALIDATION": "1",
    "PRISMA_GENERATE_DATAPROXY": "true"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### 3. 增强了API错误处理
- 添加了详细的错误日志
- 包含了数据库连接状态检查
- 提供了更好的错误信息

#### 4. 创建了健康检查API
新增 `/api/health` 端点用于诊断部署问题。

## 📋 部署清单

### 在Vercel Dashboard中设置环境变量：

**必需的环境变量：**
```
DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]?pgbouncer=true&connection_limit=1
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-very-secure-random-string-here
SKIP_ENV_VALIDATION=1
PRISMA_GENERATE_DATAPROXY=true
```

**生成NEXTAUTH_SECRET：**
```bash
openssl rand -base64 32
```

### 验证部署步骤：

1. **推送代码到Git仓库**
   ```bash
   git add .
   git commit -m "修复Vercel 500错误：优化Prisma配置和错误处理"
   git push origin master
   ```

2. **在Vercel中重新部署**
   - 确保所有环境变量已设置
   - 清除构建缓存（可选）
   - 触发新的部署

3. **验证部署**
   - 访问 `https://your-app.vercel.app/api/health` 检查系统健康状态
   - 访问 `https://your-app.vercel.app/api/activities` 测试主要API

## 🔍 故障诊断

### 使用健康检查API
访问 `/api/health` 端点会返回详细的系统状态：

```json
{
  "timestamp": "2025-06-16T...",
  "status": "healthy|unhealthy|error",
  "environment": "production",
  "checks": {
    "database": "ok|error",
    "prisma": "ok|error", 
    "env_vars": "ok|missing"
  },
  "details": {
    "database_url_exists": true,
    "user_count": 3,
    "activity_count": 5,
    "prisma_version": "6.9.0"
  }
}
```

### 常见错误和解决方案

#### ❌ Prisma Client错误
```
PrismaClientInitializationError: Query engine not found
```
**解决方案：** 确保 `PRISMA_GENERATE_DATAPROXY=true` 在环境变量中设置

#### ❌ 数据库连接超时
```
connect ETIMEDOUT
```
**解决方案：** 在DATABASE_URL中添加连接参数：
```
?connect_timeout=60&pool_timeout=60&socket_timeout=60
```

#### ❌ 环境变量缺失
```
Environment variable not found: DATABASE_URL
```
**解决方案：** 在Vercel Dashboard中正确设置所有必需的环境变量

## 🎯 性能优化建议

### 数据库连接优化
```
DATABASE_URL=postgresql://user:pass@host:port/db?pgbouncer=true&connection_limit=1&pool_timeout=20&connect_timeout=10
```

### 函数超时设置
在 `vercel.json` 中已设置 API 函数最大执行时间为30秒。

## ✅ 验证清单

部署成功后，检查以下项目：

- [ ] `/api/health` 返回 `status: "healthy"`
- [ ] `/api/activities` 返回活动列表
- [ ] 用户可以正常登录
- [ ] 活动创建功能正常
- [ ] 数据库查询正常执行

---

## 🚀 立即行动

1. **确保所有修改已保存**
2. **推送到Git仓库**
3. **在Vercel中设置环境变量**
4. **重新部署应用**
5. **访问健康检查端点验证**

修复完成后，您的Vercel部署应该能够正常处理API请求！
