# Feather Leap - 羽毛球活动管理系统

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## 项目概述
这是一个基于Next.js的飞书小程序，用于羽毛球活动的发布和报名管理。

## 技术栈
- **前端框架**: Next.js 15 with App Router
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL) with Prisma ORM
- **认证**: NextAuth.js with 飞书(Lark) OAuth
- **部署**: Vercel
- **UI组件**: 自定义组件库 + Lucide React icons

## 核心功能
1. 飞书登录认证，显示用户飞书名
2. 发布羽毛球活动（时间、地点、人数限制、费用等）
3. 用户报名/取消报名活动
4. 活动管理（编辑、删除、查看报名列表）
5. 用户个人中心（参与的活动历史）

## 数据模型
- User: 用户信息（飞书用户数据）
- Activity: 活动信息
- Registration: 报名关系
- Comment: 活动评论

## 代码规范
- 使用TypeScript
- 采用函数式组件和React Hooks
- 使用Tailwind CSS进行样式设计
- API路由使用Next.js App Router
- 数据库操作使用Prisma

## 飞书集成
- 使用@larksuiteoapi/node-sdk进行飞书API调用
- 支持飞书OAuth登录
- 获取用户飞书基本信息
