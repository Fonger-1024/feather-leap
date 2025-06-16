# Vercel 部署指南

## 🚀 修复的问题

### 1. Prisma Client 生成问题
- ✅ 在 `package.json` 中添加了 `prisma generate` 到构建脚本
- ✅ 添加了 `postinstall` 脚本自动生成 Prisma Client
- ✅ 简化了 `vercel.json` 配置，移除了不兼容的函数运行时配置

### 2. 函数运行时错误修复
- ✅ 移除了错误的 `functions` 配置 (Next.js 自动处理)
- ✅ 使用标准的 Next.js 框架配置

## 📋 部署步骤

### 1. 环境变量配置
在 Vercel Dashboard 中设置以下环境变量：

```env
# 数据库连接
DATABASE_URL=your_supabase_database_url

# NextAuth 配置
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your_random_secret_key

# 跳过环境验证（构建时）
SKIP_ENV_VALIDATION=1

# 飞书配置（可选）
LARK_APP_ID=your_lark_app_id
LARK_APP_SECRET=your_lark_app_secret
```

### 2. 部署配置
当前 `vercel.json` 配置：
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "env": {
    "SKIP_ENV_VALIDATION": "1"
  }
}
```

### 3. package.json 脚本
已更新的构建脚本：
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

## 🔧 故障排除

### 问题1: Prisma Client 未生成
**错误**: `Prisma has detected that this project was built on Vercel...`
**解决**: 已通过在构建脚本中添加 `prisma generate` 修复

### 问题2: 函数运行时版本错误
**错误**: `Function Runtimes must have a valid version`
**解决**: 已移除 `functions` 配置，让 Next.js 自动处理

### 问题3: 页面数据收集失败
**错误**: `Failed to collect page data for /activities/[id]/register`
**解决**: 已优化路由配置和静态生成设置

## ✅ 验证部署

部署完成后，检查以下功能：

1. **首页加载** - 访问根路径
2. **API 端点** - 测试 `/api/activities`
3. **认证** - 测试登录功能
4. **数据库连接** - 验证数据获取

## 🎯 下一步

1. 推送代码到 Git 仓库
2. 在 Vercel 中连接仓库
3. 配置环境变量
4. 触发自动部署

部署应该现在可以成功完成！
