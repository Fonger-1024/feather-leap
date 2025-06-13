# Feather Leap - 羽毛球活动管理系统

一个基于 Next.js 的飞书小程序，用于羽毛球活动的发布和报名管理。

## ✨ 功能特性

- 🔐 **飞书登录认证** - 使用飞书 OAuth 登录，显示用户飞书名
- 🏸 **活动发布** - 创建羽毛球活动（时间、地点、人数限制、费用等）
- 📝 **报名管理** - 用户报名/取消报名活动
- 👥 **活动管理** - 编辑、删除、查看报名列表
- 📊 **个人中心** - 查看参与的活动历史
- 💬 **活动评论** - 活动讨论功能

## 🛠 技术栈

- **前端框架**: Next.js 15 with App Router
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL) with Prisma ORM
- **认证**: NextAuth.js with 飞书(Lark) OAuth
- **部署**: Vercel
- **UI组件**: 自定义组件库 + Lucide React icons

## 📦 安装与运行

### 1. 克隆项目

\`\`\`bash
git clone <repository-url>
cd feather-leap
\`\`\`

### 2. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 3. 环境配置

复制 \`.env\` 文件并配置环境变量：

\`\`\`bash
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://username:password@db.supabase.co:5432/postgres"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Lark/Feishu App Configuration
LARK_APP_ID="your-lark-app-id"
LARK_APP_SECRET="your-lark-app-secret"
LARK_ENCRYPT_KEY="your-lark-encrypt-key"
LARK_VERIFICATION_TOKEN="your-lark-verification-token"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
\`\`\`

### 4. 数据库设置

\`\`\`bash
# 生成 Prisma 客户端
npx prisma generate

# 推送数据库模式
npx prisma db push

# (可选) 查看数据库
npx prisma studio
\`\`\`

### 5. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🗄️ 数据模型

### User (用户)
- larkUserId: 飞书用户ID
- name: 用户名
- email: 邮箱
- avatar: 头像

### Activity (活动)
- title: 活动标题
- description: 活动描述
- location: 活动地点
- startTime/endTime: 开始/结束时间
- maxParticipants: 最大参与人数
- fee: 活动费用
- status: 活动状态

### Registration (报名)
- userId: 用户ID
- activityId: 活动ID
- status: 报名状态

### Comment (评论)
- userId: 用户ID
- activityId: 活动ID
- content: 评论内容

## 🚀 部署

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

\`\`\`bash
# 或使用 Vercel CLI
npx vercel --prod
\`\`\`

### 环境变量配置

在 Vercel 控制台中配置以下环境变量：
- \`DATABASE_URL\`
- \`NEXTAUTH_URL\`
- \`NEXTAUTH_SECRET\`
- \`LARK_APP_ID\`
- \`LARK_APP_SECRET\`
- \`LARK_ENCRYPT_KEY\`
- \`LARK_VERIFICATION_TOKEN\`
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`

## 🔧 开发指南

### 项目结构

\`\`\`
src/
├── app/                 # Next.js App Router 页面
│   ├── api/            # API 路由
│   ├── activities/     # 活动相关页面
│   └── globals.css     # 全局样式
├── components/         # React 组件
│   └── ui/            # 基础 UI 组件
└── lib/               # 工具函数
    ├── auth.ts        # NextAuth 配置
    ├── db.ts          # 数据库连接
    ├── lark.ts        # 飞书 SDK
    └── utils.ts       # 工具函数
\`\`\`

### 代码规范

- 使用 TypeScript
- 采用函数式组件和 React Hooks
- 使用 Tailwind CSS 进行样式设计
- API 路由使用 Next.js App Router
- 数据库操作使用 Prisma

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📄 许可证

MIT License
