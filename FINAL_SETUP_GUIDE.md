# 🚀 Feather Leap 最终配置指南

## 当前状态 ✅
- ✅ Next.js 项目结构完整
- ✅ 所有依赖已安装
- ✅ Tailwind CSS v4 配置修复完成
- ✅ 开发服务器运行正常 (http://localhost:3001)
- ✅ 代码无编译错误

## 🔴 需要完成的关键配置

### 1. Supabase 数据库设置

#### 步骤 1: 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 记录项目信息：
   - Project URL: `https://your-project-id.supabase.co`
   - API Key (anon public): `eyJhbGc...`
   - Database Password: 你设置的密码

#### 步骤 2: 获取数据库连接字符串
1. 在 Supabase Dashboard → Settings → Database
2. 复制 Connection string (URI)
3. 格式类似：`postgresql://postgres.your-project-ref:password@aws-0-region.pooler.supabase.com:5432/postgres`

#### 步骤 3: 更新环境变量
编辑 `.env` 文件，替换以下变量：
```env
# 替换为实际的 Supabase 数据库 URL
DATABASE_URL="postgresql://postgres.your-project-ref:your-password@aws-0-region.pooler.supabase.com:5432/postgres"

# 替换为实际的 Supabase 项目 URL 和 API Key
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

#### 步骤 4: 初始化数据库
```bash
npx prisma db push
```

### 2. 飞书应用配置

#### 步骤 1: 完善应用信息
1. 访问 [飞书开放平台](https://open.feishu.cn/app)
2. 选择你的应用 (App ID: cli_a8c0f6c52fe8100c)
3. 完善应用信息：
   - 应用名称：`羽毛球活动管理`
   - 应用描述：`企业内部羽毛球活动发布和报名管理系统`
   - 应用图标：上传适当图标

#### 步骤 2: 配置回调地址
在 "安全设置" → "重定向URL" 中添加：
```
http://localhost:3001/api/auth/callback/lark
```

#### 步骤 3: 发布应用
1. 进入 "发布管理"
2. 选择 "企业内部应用发布"
3. 填写发布说明
4. 提交审核

### 3. 测试完整流程

配置完成后，执行以下测试：

1. **启动开发服务器**：
   ```bash
   npm run dev
   ```

2. **访问应用**：
   打开 http://localhost:3001

3. **测试飞书登录**：
   - 点击登录按钮
   - 完成飞书 OAuth 流程
   - 确认用户信息正确显示

4. **测试核心功能**：
   - 创建活动
   - 报名活动
   - 查看个人中心

## 🛠️ 快速命令

```bash
# 检查项目状态
npm run validate

# 更新数据库结构
npx prisma db push

# 生成 Prisma 客户端
npx prisma generate

# 查看数据库
npx prisma studio

# 添加示例数据（数据库配置完成后）
npm run db:seed
```

## 📞 如需帮助

如果在配置过程中遇到问题，请提供：
1. 具体的错误信息
2. 完成了哪些步骤
3. 当前的 `.env` 配置（隐藏敏感信息）

配置完成后，你将拥有一个完整可用的羽毛球活动管理系统！🏸
