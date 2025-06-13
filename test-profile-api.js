// 测试用户资料API的临时脚本
console.log('测试 /api/user/profile 接口...')

// 模拟测试不同的用户ID
const testUserProfile = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/user/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    const result = await response.json()
    console.log('API响应:', result)
    
    if (response.ok) {
      console.log('✅ API正常工作')
    } else {
      console.log('❌ API返回错误:', result.error)
    }
  } catch (error) {
    console.error('❌ 请求失败:', error)
  }
}

testUserProfile()
