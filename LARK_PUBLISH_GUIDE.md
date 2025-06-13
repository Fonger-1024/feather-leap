# 🚀 飞书应用发布指南

## 问题描述
在飞书开放平台中，权限配置（如 `contact:user.base:readonly`）需要发布后才能生效。开发阶段的权限配置不会立即生效。

## 🔧 解决方案

### 方案一：发布应用（推荐）

#### 1. 完善应用信息
访问 [飞书开放平台](https://open.feishu.cn/app)，进入你的应用：

**基本信息**
- 应用名称：`羽毛球活动管理`
- 应用描述：`企业内部羽毛球活动发布和报名管理系统`
- 应用图标：上传一个羽毛球相关的图标
- 应用简介：详细描述应用功能

#### 2. 配置权限范围
在"权限管理"中确认以下权限：
```
✅ contact:user.base:readonly  # 获取用户基本信息
✅ authen:identity             # 身份验证
```

#### 3. 配置重定向URL
在"安全设置" → "重定向URL"中添加：
```
开发环境: http://localhost:3001/api/auth/callback/lark
生产环境: https://your-domain.com/api/auth/callback/lark
```

#### 4. 提交发布申请
1. 点击"发布管理"
2. 填写发布说明
3. 选择发布范围：
   - **企业内部应用**：仅限当前企业使用
   - **应用商店**：公开发布（需要审核）

#### 5. 等待审核
- 企业内部应用：通常几分钟到几小时
- 应用商店应用：可能需要1-3个工作日

### 方案二：使用测试企业（临时方案）

如果需要立即测试，可以：

#### 1. 创建测试企业
1. 注册一个新的飞书账号
2. 创建测试企业
3. 在测试企业中创建应用

#### 2. 配置测试应用
```javascript
// 临时测试配置
const testConfig = {
  LARK_APP_ID: "cli_test_xxxx",
  LARK_APP_SECRET: "test_secret_xxxx",
  // 测试环境回调地址
  CALLBACK_URL: "http://localhost:3001/api/auth/callback/lark"
}
```

### 方案三：修改权限范围（开发环境）

在开发阶段，可以使用最小权限进行测试：

#### 1. 更新认证配置
让我为你创建一个开发环境的配置：

```typescript
// src/lib/auth-dev.ts
const developmentConfig = {
  providers: [
    {
      id: 'lark',
      name: 'Lark',
      type: 'oauth',
      authorization: {
        url: 'https://open.feishu.cn/open-apis/authen/v1/authorize',
        params: {
          app_id: process.env.LARK_APP_ID,
          redirect_uri: \`\${process.env.NEXTAUTH_URL}/api/auth/callback/lark\`,
          // 开发阶段使用最小权限
          scope: '', // 空权限，只做身份验证
          state: 'dev_state',
        },
      },
      // 简化的用户信息获取
      userinfo: async (tokens) => {
        return {
          id: 'dev_user_' + Date.now(),
          name: '开发测试用户',
          email: 'dev@test.com',
          image: null,
        }
      },
    },
  ],
}
```

## 📋 发布检查清单

### 发布前检查
- [ ] 应用名称和描述完整
- [ ] 应用图标已上传
- [ ] 权限配置正确
- [ ] 回调地址配置正确
- [ ] 功能测试完成

### 发布后验证
- [ ] 登录功能正常
- [ ] 用户信息获取正常
- [ ] 权限验证通过
- [ ] 所有功能可用

## 🔨 临时解决方案

在等待发布审核期间，我们可以创建一个模拟登录功能：

### 1. 添加开发模式登录
创建一个开发环境的登录方式：

```typescript
// 开发环境模拟登录
if (process.env.NODE_ENV === 'development') {
  // 添加模拟登录提供者
  providers.push({
    id: 'dev-mock',
    name: '开发模式登录',
    type: 'credentials',
    credentials: {
      name: { label: "用户名", type: "text", placeholder: "输入测试用户名" }
    },
    async authorize(credentials) {
      // 模拟用户数据
      return {
        id: 'dev_' + credentials?.name,
        name: credentials?.name || '测试用户',
        email: \`\${credentials?.name}@dev.test\`,
        image: null,
      }
    }
  })
}
```

### 2. 更新登录界面
添加开发模式登录选项。

## 🎯 推荐操作步骤

### 立即可以做的：
1. **完善应用信息** - 添加名称、描述、图标
2. **提交内部发布** - 选择企业内部应用快速发布
3. **配置回调地址** - 使用修复脚本提供的地址

### 等待发布期间：
1. **使用模拟登录** - 继续开发其他功能
2. **完善应用功能** - 确保发布后能完美运行
3. **准备生产环境** - 配置生产域名和环境

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看飞书开放平台文档
2. 联系飞书技术支持
3. 使用本项目提供的临时解决方案

---

**更新时间**: 2025年6月13日  
**状态**: 等待飞书应用发布审核
