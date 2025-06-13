// 将示例活动数据推送到数据库
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('开始推送示例数据到数据库...')

  try {
    // 1. 首先创建示例用户
    const users = [
      {
        larkUserId: 'mock_user_1',
        name: '张三',
        email: 'zhangsan@example.com',
        avatar: null
      },
      {
        larkUserId: 'mock_user_2', 
        name: '李四',
        email: 'lisi@example.com',
        avatar: null
      },
      {
        larkUserId: 'mock_user_3',
        name: '王五',
        email: 'wangwu@example.com',
        avatar: null
      }
    ]

    console.log('创建示例用户...')
    for (const userData of users) {
      await prisma.user.upsert({
        where: { larkUserId: userData.larkUserId },
        update: userData,
        create: userData
      })
      console.log(`✓ 用户 ${userData.name} 创建/更新成功`)
    }

    // 2. 创建示例活动
    const activityData = {
      title: '周末羽毛球活动',
      description: '欢迎大家参加周末羽毛球活动，一起挥洒汗水！',
      location: '体育中心A馆',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明天
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 明天+2小时
      maxPlayers: 8,
      currentPlayers: 1,
      fee: 30,
      status: 'OPEN',
      creatorId: '' // 将在下面设置
    }

    // 获取张三的用户ID
    const creator = await prisma.user.findUnique({
      where: { larkUserId: 'mock_user_1' }
    })    if (!creator) {
      throw new Error('创建者用户不存在')
    }

    activityData.creatorId = creator.id

    console.log('创建示例活动...')
    // 先检查活动是否已存在
    const existingActivity = await prisma.activity.findFirst({
      where: { title: activityData.title }
    })

    let activity
    if (existingActivity) {
      console.log('活动已存在，跳过创建')
      activity = existingActivity
    } else {
      activity = await prisma.activity.create({
        data: activityData,
        include: {
          creator: true
        }
      })
    }

    console.log(`✓ 活动 "${activity.title}" 创建/更新成功, ID: ${activity.id}`)

    // 3. 创建活动报名记录
    console.log('创建活动报名记录...')
    const registration = await prisma.registration.upsert({
      where: {
        userId_activityId: {
          userId: creator.id,
          activityId: activity.id
        }
      },
      update: {},
      create: {
        userId: creator.id,
        activityId: activity.id,
        status: 'REGISTERED'
      },
      include: {
        user: true,
        activity: true
      }
    })

    console.log(`✓ 用户 ${registration.user.name} 报名活动 "${registration.activity.title}" 成功`)

    // 4. 验证数据
    console.log('\n验证推送结果...')
    const activities = await prisma.activity.findMany({
      include: {
        creator: true,
        registrations: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            registrations: {
              where: { status: 'REGISTERED' }
            }
          }
        }
      }
    })

    console.log(`\n✅ 成功推送 ${activities.length} 个活动到数据库`)
    activities.forEach(activity => {
      console.log(`- ${activity.title}`)
      console.log(`  创建者: ${activity.creator.name}`)
      console.log(`  报名人数: ${activity._count.registrations}`)
      console.log(`  活动时间: ${activity.startTime.toLocaleString()}`)
      console.log('')
    })

    console.log('🎉 数据推送完成！')

  } catch (error) {
    console.error('❌ 推送数据时出错:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
