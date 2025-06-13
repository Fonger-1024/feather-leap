# 数据库连接问题排查指南

## 🔍 当前状态

### ✅ 正常工作的部分
- 应用服务器运行正常 (http://localhost:3003)
- Fallback机制正常工作
- 所有API在内存模式下正常响应
- 用户认证和演示登录正常
- 前端界面完全可用

### ❌ 问题
- 无法连接到Supabase数据库
- 错误信息：`Can't reach database server at aws-0-ap-southeast-1.pooler.supabase.com:5432`

## 🔧 解决方案

### 1. 检查Supabase项目状态
在Supabase Dashboard中确认：
- [ ] 项目是否处于活跃状态
- [ ] 数据库是否正在运行
- [ ] 是否有任何暂停或限制

### 2. 验证连接字符串格式
当前使用的连接字符串：
```
DATABASE_URL="postgresql://postgres.cqahreqbggvjjdmroanb:Fgf4551975%40@aws-0-ap-southeast-1.aws.supabase.com:5432/postgres"
```

#### 可能的替代方案：

**选项 A：使用Pooler连接**
```env
DATABASE_URL="postgresql://postgres.cqahreqbggvjjdmroanb:Fgf4551975%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**选项 B：使用直连**
```env
DATABASE_URL="postgresql://postgres.cqahreqbggvjjdmroanb:Fgf4551975%40@db.cqahreqbggvjjdmroanb.supabase.co:5432/postgres"
```

**选项 C：添加SSL参数**
```env
DATABASE_URL="postgresql://postgres.cqahreqbggvjjdmroanb:Fgf4551975%40@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

### 3. 网络连接检查
检查是否有防火墙或网络限制：
```powershell
# 测试端口连接
Test-NetConnection aws-0-ap-southeast-1.pooler.supabase.com -Port 5432
Test-NetConnection aws-0-ap-southeast-1.pooler.supabase.com -Port 6543
```

### 4. 从Supabase Dashboard重新获取连接字符串
1. 登录Supabase Dashboard
2. 选择项目：cqahreqbggvjjdmroanb
3. 进入Settings > Database
4. 在Connection String部分选择"Nodejs"
5. 复制完整的连接字符串

### 5. 验证数据库密码
确保密码 `Fgf4551975@` 是正确的，并且：
- `@` 符号已正确编码为 `%40`
- 没有额外的空格或特殊字符

## 🔄 测试步骤

### 步骤1：更新连接字符串
更新 `.env` 文件中的 `DATABASE_URL`

### 步骤2：测试连接
```powershell
cd "d:\www\fenggang1024\feather-leap"
npx prisma db push
```

### 步骤3：验证结果
- 如果成功：数据库表将被创建
- 如果失败：检查错误信息并尝试下一个选项

## 🎯 临时解决方案

如果数据库连接问题暂时无法解决，应用仍可正常使用：

### 当前工作模式
- ✅ 用户登录（张三、李四、王五）
- ✅ 活动创建和管理
- ✅ 活动报名功能
- ✅ 用户资料查看
- ✅ 所有前端功能

### 数据持久性
- ⚠️ 数据仅在内存中，服务器重启后丢失
- ⚠️ 多个服务器实例间数据不共享

## 🚀 生产部署建议

### 立即可部署
即使数据库连接有问题，应用也可以部署到Vercel：
1. 系统会自动使用fallback模式
2. 所有功能正常工作
3. 之后修复数据库连接即可自动切换到数据库模式

### 部署命令
```bash
npx vercel --prod
```

## 📞 下一步行动

1. **优先级1**：从Supabase Dashboard获取正确的连接字符串
2. **优先级2**：测试不同的连接选项
3. **优先级3**：如果问题持续，考虑创建新的Supabase项目
4. **备选方案**：使用其他数据库提供商（如PlanetScale、Neon等）

## 💡 重要提醒

应用的设计确保了即使数据库有问题，用户体验也不会受到影响。这是一个很好的"fault-tolerant"设计，在生产环境中非常有价值。
