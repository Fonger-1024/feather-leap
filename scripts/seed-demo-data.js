#!/usr/bin/env node

/**
 * Demo data seeder for Feather Leap
 * This script creates sample data for testing purposes
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const sampleUsers = [
  {
    larkUserId: 'demo-user-1',
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: null,
  },
  {
    larkUserId: 'demo-user-2', 
    name: '李四',
    email: 'lisi@example.com',
    avatar: null,
  },
  {
    larkUserId: 'demo-user-3',
    name: '王五',
    email: 'wangwu@example.com',
    avatar: null,
  }
]

const sampleActivities = [
  {
    title: '周末羽毛球友谊赛',
    description: '欢迎所有羽毛球爱好者参加！我们将在体育馆举办友谊赛，提供球拍和球。适合各个水平的选手，主要目的是运动和交友。',
    location: '市体育馆3号场地',
    startTime: new Date('2025-06-15T09:00:00'),
    endTime: new Date('2025-06-15T12:00:00'),
    maxParticipants: 8,
    fee: 30.0,
    status: 'OPEN'
  },
  {
    title: '羽毛球技巧训练营',
    description: '专业教练指导的技巧训练课程，重点训练发球、扣杀和网前技术。适合有一定基础的选手参加。',
    location: '羽毛球俱乐部A馆',
    startTime: new Date('2025-06-20T19:00:00'),
    endTime: new Date('2025-06-20T21:00:00'),
    maxParticipants: 12,
    fee: 80.0,
    status: 'OPEN'
  },
  {
    title: '公司羽毛球团建',
    description: '公司内部羽毛球团建活动，增进同事间的友谊，放松工作压力。会有小游戏和奖品。',
    location: '公司附近羽毛球馆',
    startTime: new Date('2025-06-18T18:30:00'),
    endTime: new Date('2025-06-18T20:30:00'),
    maxParticipants: 16,
    fee: 0.0,
    status: 'OPEN'
  }
]

async function seedData() {
  console.log('🌱 开始播种演示数据...\n')

  try {
    // 清理现有数据（谨慎使用！）
    const shouldClean = process.argv.includes('--clean')
    if (shouldClean) {
      console.log('🧹 清理现有数据...')
      await prisma.registration.deleteMany()
      await prisma.comment.deleteMany()
      await prisma.activity.deleteMany()
      await prisma.user.deleteMany()
      console.log('✅ 数据清理完成\n')
    }

    // 创建示例用户
    console.log('👥 创建示例用户...')
    const users = []
    for (const userData of sampleUsers) {
      const user = await prisma.user.upsert({
        where: { larkUserId: userData.larkUserId },
        update: userData,
        create: userData,
      })
      users.push(user)
      console.log(`✅ 创建用户: ${user.name}`)
    }

    // 创建示例活动
    console.log('\n🏸 创建示例活动...')
    const activities = []
    for (let i = 0; i < sampleActivities.length; i++) {
      const activityData = sampleActivities[i]
      const creator = users[i % users.length]
      
      const activity = await prisma.activity.create({
        data: {
          ...activityData,
          creatorId: creator.id,
        },
      })
      activities.push(activity)
      console.log(`✅ 创建活动: ${activity.title}`)
    }

    // 创建示例报名
    console.log('\n📝 创建示例报名...')
    for (const activity of activities) {
      // 随机选择一些用户报名
      const registrationCount = Math.floor(Math.random() * 3) + 1
      const selectedUsers = users
        .filter(user => user.id !== activity.creatorId)
        .slice(0, registrationCount)
      
      for (const user of selectedUsers) {
        await prisma.registration.create({
          data: {
            activityId: activity.id,
            userId: user.id,
            status: 'CONFIRMED',
          },
        })
        console.log(`✅ ${user.name} 报名了 ${activity.title}`)
      }
    }

    // 创建示例评论
    console.log('\n💬 创建示例评论...')
    const comments = [
      '期待这次活动！',
      '什么时候集合呢？',
      '需要自己带球拍吗？',
      '我是新手，可以参加吗？',
      '活动很棒，谢谢组织！'
    ]

    for (const activity of activities) {
      const commentCount = Math.floor(Math.random() * 3)
      for (let i = 0; i < commentCount; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)]
        const randomComment = comments[Math.floor(Math.random() * comments.length)]
        
        await prisma.comment.create({
          data: {
            activityId: activity.id,
            userId: randomUser.id,
            content: randomComment,
          },
        })
        console.log(`✅ ${randomUser.name} 评论了 ${activity.title}`)
      }
    }

    console.log('\n🎉 演示数据播种完成！')
    console.log('\n📊 数据统计:')
    console.log(`👥 用户: ${await prisma.user.count()}`)
    console.log(`🏸 活动: ${await prisma.activity.count()}`)
    console.log(`📝 报名: ${await prisma.registration.count()}`)
    console.log(`💬 评论: ${await prisma.comment.count()}`)
    
  } catch (error) {
    console.error('❌ 播种数据时出错:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行脚本
if (require.main === module) {
  console.log('🌱 Feather Leap 数据播种器\n')
  console.log('用法:')
  console.log('  node scripts/seed-demo-data.js          # 添加演示数据')
  console.log('  node scripts/seed-demo-data.js --clean  # 清理并重新播种\n')
  
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    process.exit(0)
  }
  
  seedData()
}

module.exports = { seedData }
