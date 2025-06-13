# 🔧 飞书登录错误修复指南

## 错误分析

**错误码**: 20029  
**错误信息**: redirect_uri 请求不合法  
**原因**: 飞书应用的回调地址配置与实际请求不匹配

## 🛠 解决方案

### 1. 检查当前回调地址

当前配置的回调地址是：
```
http://localhost:3001/api/auth/callback/lark
```

### 2. 飞书开放平台配置

1. **登录飞书开放平台**
   - 访问：https://open.feishu.cn/app
   - 使用管理员账号登录

2. **找到你的应用**
   - 应用 ID: `cli_a8c0f6c52fe8100c`
   - 点击进入应用详情

3. **配置回调地址**
   - 进入 "安全设置" > "重定向URL"
   - 添加以下回调地址：
     ```
     http://localhost:3001/api/auth/callback/lark
     ```
   - 点击保存

### 3. 权限配置

确保应用具有以下权限：
- `contact:user.base:readonly` - 获取用户基本信息

### 4. 应用状态检查

确保应用状态为：
- ✅ **已发布** 或 **开发中**
- ✅ **已启用**

## 🚀 快速修复步骤

### 方法一：修改飞书应用配置（推荐）

1. 打开飞书开放平台
2. 找到应用 ID: `cli_a8c0f6c52fe8100c`
3. 在重定向URL中添加：`http://localhost:3001/api/auth/callback/lark`
4. 保存配置

### 方法二：修改本地端口（临时方案）

如果不能修改飞书配置，可以临时修改本地端口：

1. 停止当前开发服务器（Ctrl+C）
2. 修改环境变量：
   ```bash
   # 在 .env 文件中修改
   NEXTAUTH_URL="http://localhost:3000"
   ```
3. 强制使用 3000 端口启动：
   ```bash
   npx kill-port 3000
   npm run dev -- --port 3000
   ```

## 🔍 验证配置

### 1. 检查环境变量
确保 `.env` 文件中的配置正确：
```env
NEXTAUTH_URL="http://localhost:3001"
LARK_APP_ID="cli_a8c0f6c52fe8100c"
LARK_APP_SECRET="68tW0voVRskhqifcwU5k7dr8i6apblQK"
```

### 2. 测试登录流程
1. 访问：http://localhost:3001
2. 点击 "使用飞书登录"
3. 应该跳转到飞书授权页面
4. 授权后应该能正常回调

## 📋 完整的飞书应用配置清单

在飞书开放平台确保配置了：

### 基本信息
- ✅ 应用名称：羽毛球活动管理
- ✅ 应用描述：企业内部羽毛球活动管理系统
- ✅ 应用图标：已上传

### 安全设置
- ✅ 重定向URL：`http://localhost:3001/api/auth/callback/lark`
- ✅ （可选）生产环境：`https://your-domain.com/api/auth/callback/lark`

### 权限配置
- ✅ `contact:user.base:readonly` - 获取用户基本信息
- ✅ （可选）`contact:user.email:readonly` - 获取用户邮箱

### 发布设置
- ✅ 应用状态：已发布/开发中
- ✅ 可用范围：全部员工

## 🚨 常见问题

### Q: 修改了回调地址，但还是报错？
A: 飞书平台配置可能需要几分钟生效，请等待后重试。

### Q: 没有飞书应用管理权限怎么办？
A: 联系企业管理员或IT部门协助配置。

### Q: 开发环境配置好了，生产环境怎么办？
A: 生产环境需要添加对应的域名回调地址，如：
```
https://your-app.vercel.app/api/auth/callback/lark
```

## 📞 技术支持

如果问题仍然存在，请检查：
1. 飞书应用是否有正确的权限
2. 企业是否允许使用自建应用
3. 网络是否能正常访问飞书API

---

**最后更新**: 2025年6月13日  
**适用版本**: Feather Leap v1.0
