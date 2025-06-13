# Feather Leap 开发指南

## 🚀 快速开始

### 1. 环境准备

确保你的开发环境满足以下要求：
- Node.js 18+ 
- npm 或 yarn
- Git

### 2. 项目设置

```bash
# 克隆项目
git clone <repository-url>
cd feather-leap

# 安装依赖并初始化
npm run setup
```

### 3. 环境配置

复制并配置环境变量：

```bash
# 编辑 .env 文件，配置以下变量：

# 数据库连接（Supabase）
DATABASE_URL="postgresql://username:password@db.supabase.co:5432/postgres"

# NextAuth 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# 飞书应用配置
LARK_APP_ID="your-lark-app-id"
LARK_APP_SECRET="your-lark-app-secret"
LARK_ENCRYPT_KEY="your-lark-encrypt-key"
LARK_VERIFICATION_TOKEN="your-lark-verification-token"

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 4. 数据库设置

```bash
# 推送数据库架构到 Supabase
npm run db:push

# （可选）打开 Prisma Studio 查看数据
npm run db:studio
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 📁 项目结构

```
src/
├── app/                 # Next.js App Router 页面
│   ├── api/            # API 路由
│   │   ├── activities/ # 活动相关 API
│   │   ├── auth/       # 认证 API
│   │   └── user/       # 用户相关 API
│   ├── activities/     # 活动页面
│   ├── profile/        # 用户中心页面
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 首页
├── components/         # React 组件
│   ├── ui/            # 基础 UI 组件
│   ├── activity.tsx   # 活动相关组件
│   ├── auth.tsx       # 认证组件
│   └── providers.tsx  # Context 提供者
└── lib/               # 工具函数
    ├── auth.ts        # NextAuth 配置
    ├── db.ts          # 数据库连接
    ├── lark.ts        # 飞书 SDK
    └── utils.ts       # 通用工具函数
```

## 🛠 开发命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 数据库相关
npm run db:generate    # 生成 Prisma 客户端
npm run db:push        # 推送架构到数据库
npm run db:studio      # 打开数据库管理界面
npm run db:reset       # 重置数据库

# 验证设置
npm run validate       # 验证开发环境配置
```

## 🔧 核心功能模块

### 1. 认证系统
- 使用 NextAuth.js 和飞书 OAuth
- 文件位置：`src/lib/auth.ts`, `src/components/auth.tsx`

### 2. 活动管理
- 创建、编辑、删除活动
- 文件位置：`src/components/activity.tsx`, `src/app/api/activities/`

### 3. 报名系统
- 用户报名/取消报名活动
- 文件位置：`src/app/api/activities/[id]/register/`

### 4. 用户中心
- 查看创建的活动和参与的活动
- 文件位置：`src/app/profile/`

## 🎨 UI 组件库

项目使用自定义 UI 组件库，基于 Tailwind CSS 构建：

- `Button` - 按钮组件
- `Card` - 卡片组件
- `Input` - 输入框组件
- `Badge` - 标签组件
- `LoadingSpinner` - 加载动画

所有组件位于 `src/components/ui/` 目录。

## 📦 状态管理

- 使用 React Hooks 进行本地状态管理
- NextAuth 处理用户认证状态
- 服务端状态通过 API 调用获取

## 🗄️ 数据库架构

### User 用户表
```prisma
model User {
  id               String   @id @default(cuid())
  larkUserId       String   @unique
  name             String
  email            String?
  avatar           String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  createdActivities Activity[]
  registrations     Registration[]
  comments          Comment[]
}
```

### Activity 活动表
```prisma
model Activity {
  id              String         @id @default(cuid())
  title           String
  description     String?
  location        String
  startTime       DateTime
  endTime         DateTime
  maxParticipants Int            @default(10)
  fee             Float          @default(0)
  status          ActivityStatus @default(OPEN)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  creator       User           @relation(fields: [creatorId], references: [id])
  creatorId     String
  registrations Registration[]
  comments      Comment[]
}
```

## 🔐 安全考虑

1. **环境变量保护**：敏感信息存储在 `.env` 文件中
2. **API 路由保护**：使用 NextAuth session 验证
3. **输入验证**：在 API 路由中验证用户输入
4. **权限控制**：确保用户只能操作自己的数据

## 🚀 部署

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 在 Vercel 控制台配置环境变量
3. 自动部署

### 环境变量配置

在部署平台设置以下环境变量：
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `LARK_APP_ID`
- `LARK_APP_SECRET`
- `LARK_ENCRYPT_KEY`
- `LARK_VERIFICATION_TOKEN`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🐛 调试技巧

1. **查看数据库**：使用 `npm run db:studio`
2. **API 调试**：检查浏览器 Network 选项卡
3. **认证问题**：检查 NextAuth 调试日志
4. **构建错误**：运行 `npm run build` 查看详细错误

## 📚 相关文档

- [Next.js 文档](https://nextjs.org/docs)
- [NextAuth.js 文档](https://next-auth.js.org)
- [Prisma 文档](https://www.prisma.io/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [飞书开放平台文档](https://open.feishu.cn/document/)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

MIT License
