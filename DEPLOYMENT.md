# 🚀 Feather Leap 部署检查清单

## 📋 部署前准备

### ✅ 代码检查
- [ ] 所有功能正常工作
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 错误
- [ ] 构建成功 (`npm run build`)

### ✅ 环境配置
- [ ] 生产数据库已创建（Supabase）
- [ ] 飞书应用已配置
- [ ] 所有环境变量已准备

### ✅ 数据库
- [ ] Prisma 架构已推送到生产数据库
- [ ] 数据库连接正常

## 🌐 Vercel 部署步骤

### 1. 连接仓库
1. 登录 [Vercel 控制台](https://vercel.com)
2. 点击 "New Project"
3. 连接 GitHub 仓库
4. 选择 `feather-leap` 项目

### 2. 配置项目
```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: (留空，使用默认)
Install Command: npm install
```

### 3. 环境变量配置

在 Vercel 项目设置 → Environment Variables 中添加：

#### 数据库
```
DATABASE_URL=postgresql://username:password@db.supabase.co:5432/postgres
```

#### NextAuth
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-production-secret-key
```

#### 飞书配置
```
LARK_APP_ID=your-lark-app-id
LARK_APP_SECRET=your-lark-app-secret
LARK_ENCRYPT_KEY=your-lark-encrypt-key
LARK_VERIFICATION_TOKEN=your-lark-verification-token
```

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. 部署
1. 点击 "Deploy"
2. 等待构建完成
3. 访问部署的 URL 测试功能

## 🔧 飞书应用配置

### 1. 回调地址配置
在飞书开放平台配置回调地址：
```
https://your-app.vercel.app/api/auth/callback/lark
```

### 2. 应用权限
确保应用具有以下权限：
- 获取用户基本信息
- 获取用户邮箱

## 🗄️ Supabase 配置

### 1. 创建项目
1. 登录 [Supabase](https://supabase.com)
2. 创建新项目
3. 记录数据库连接信息

### 2. 推送架构
```bash
# 设置生产环境 DATABASE_URL
DATABASE_URL="postgresql://..." npx prisma db push
```

### 3. 配置 RLS（行级安全）
根据需要配置数据库安全策略。

## ✅ 部署后验证

### 功能测试
- [ ] 飞书登录正常
- [ ] 创建活动功能
- [ ] 报名功能
- [ ] 用户中心功能
- [ ] 活动详情页面

### 性能检查
- [ ] 页面加载速度
- [ ] API 响应时间
- [ ] 移动端适配

### 安全检查
- [ ] HTTPS 正常
- [ ] 环境变量安全
- [ ] API 权限控制

## 🔄 自动部署

### GitHub Actions（可选）
创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 故障排除

### 常见问题

#### 1. 构建失败
- 检查 TypeScript 错误
- 验证所有依赖已安装
- 检查环境变量配置

#### 2. 数据库连接失败
- 验证 DATABASE_URL 正确性
- 检查 Supabase 项目状态
- 确认网络连接

#### 3. 飞书登录失败
- 检查 LARK_APP_ID 和 LARK_APP_SECRET
- 验证回调地址配置
- 检查应用权限设置

#### 4. 页面加载失败
- 检查 NEXTAUTH_URL 配置
- 验证所有环境变量
- 查看 Vercel 部署日志

## 📊 监控和分析

### Vercel Analytics
在项目设置中启用：
- Web Analytics
- Speed Insights
- Audience Insights

### 错误监控
考虑集成：
- Sentry
- LogRocket
- Datadog

## 🔄 更新部署

### 代码更新
1. 推送代码到 GitHub
2. Vercel 自动重新部署
3. 验证更新功能

### 数据库更新
```bash
# 如果有数据库架构变更
DATABASE_URL="production-url" npx prisma db push
```

## 📞 支持联系

如遇部署问题，请：
1. 检查 Vercel 部署日志
2. 查看本文档故障排除部分
3. 联系技术支持团队

---

**最后更新**: 2025年6月13日
**文档版本**: 1.0
