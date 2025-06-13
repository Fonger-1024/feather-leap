#!/usr/bin/env node

/**
 * 端口检测和配置修复脚本
 * 自动检测当前运行端口并更新环境配置
 */

const fs = require('fs')
const path = require('path')

function getCurrentPort() {
  // 尝试从进程参数获取端口
  const args = process.argv
  const portIndex = args.findIndex(arg => arg === '--port')
  if (portIndex !== -1 && args[portIndex + 1]) {
    return args[portIndex + 1]
  }
  
  // 检查 3000 端口是否被占用
  const net = require('net')
  
  return new Promise((resolve) => {
    const server = net.createServer()
    
    server.listen(3000, () => {
      server.close(() => {
        console.log('✅ 端口 3000 可用')
        resolve('3000')
      })
    })
    
    server.on('error', () => {
      console.log('⚠️ 端口 3000 被占用，使用 3001')
      resolve('3001')
    })
  })
}

async function updateEnvFile(port) {
  const envPath = path.join(__dirname, '..', '.env')
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env 文件不存在')
    return false
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8')
  const newUrl = `http://localhost:${port}`
  
  // 更新 NEXTAUTH_URL
  envContent = envContent.replace(
    /NEXTAUTH_URL="[^"]*"/,
    `NEXTAUTH_URL="${newUrl}"`
  )
  
  fs.writeFileSync(envPath, envContent)
  
  console.log(`✅ 已更新 NEXTAUTH_URL 为: ${newUrl}`)
  return true
}

function displayLarkConfig(port) {
  const callbackUrl = `http://localhost:${port}/api/auth/callback/lark`
  
  console.log('\n🔧 飞书应用配置信息:')
  console.log('─'.repeat(50))
  console.log(`📱 应用 ID: cli_a8c0f6c52fe8100c`)
  console.log(`🔗 回调地址: ${callbackUrl}`)
  console.log('─'.repeat(50))
  console.log('\n📋 配置步骤:')
  console.log('1. 访问: https://open.feishu.cn/app')
  console.log('2. 找到应用: cli_a8c0f6c52fe8100c')
  console.log('3. 进入"安全设置" > "重定向URL"')
  console.log(`4. 添加回调地址: ${callbackUrl}`)
  console.log('5. 保存配置')
  console.log('\n⚡ 配置完成后重启开发服务器测试登录功能')
}

async function main() {
  console.log('🔍 检测端口配置...\n')
  
  try {
    const port = await getCurrentPort()
    console.log(`🎯 检测到端口: ${port}`)
    
    const updated = await updateEnvFile(port)
    
    if (updated) {
      displayLarkConfig(port)
      
      console.log('\n🚀 修复完成！')
      console.log('请按照上述步骤配置飞书应用，然后重启开发服务器。')
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = { getCurrentPort, updateEnvFile }
