// 活动API - 纯数据库版本
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 添加详细的错误日志
    console.log('API调用开始: /api/activities')
    
    // 检查数据库连接
    try {
      await prisma.$connect()
      console.log('数据库连接成功')
    } catch (dbError) {
      console.error('数据库连接失败:', dbError)
      return NextResponse.json(
        { 
          error: '数据库连接失败',
          details: process.env.NODE_ENV === 'development' ? dbError : undefined
        },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const creatorId = searchParams.get('creatorId')

    const whereClause: Record<string, unknown> = {}

    if (status && status !== 'ALL') {
      whereClause.status = status
    }

    if (creatorId) {
      whereClause.creator = { larkUserId: creatorId }
    }

    console.log('查询条件:', whereClause)

    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            larkUserId: true,
          },
        },
        registrations: {
          where: {
            status: 'REGISTERED',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                larkUserId: true,
              },
            },
          },
        },
        _count: {
          select: {
            registrations: {
              where: {
                status: 'REGISTERED',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    const activitiesWithStats = activities.map(activity => ({
      ...activity,
      maxParticipants: activity.maxPlayers,
      participantCount: activity.currentPlayers,
    }))

    console.log(`成功获取${activitiesWithStats.length}个活动`)

    return NextResponse.json({
      activities: activitiesWithStats,
      total: activitiesWithStats.length,
      source: 'database'
    })
  } catch (error) {
    console.error('获取活动列表失败:', error)
    
    // 返回更详细的错误信息
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      { 
        error: '获取活动列表失败',
        message: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    // 确保关闭数据库连接
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API调用开始: POST /api/activities')
    
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log('用户未登录')
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    console.log('用户已登录:', session.user)

    const data = await request.json()
    console.log('收到的数据:', data)

    if (!data.title || !data.location || !data.startTime || !data.endTime) {
      console.log('缺少必填字段')
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    const userId = (session as { user: { larkUserId?: string; id?: string } }).user?.larkUserId || (session as { user: { larkUserId?: string; id?: string } }).user?.id
    console.log('用户ID:', userId)

    // 检查数据库连接
    try {
      await prisma.$connect()
      console.log('数据库连接成功')
    } catch (dbError) {
      console.error('数据库连接失败:', dbError)
      return NextResponse.json(
        { 
          error: '数据库连接失败',
          details: process.env.NODE_ENV === 'development' ? dbError : undefined
        },
        { status: 500 }
      )
    }    const newActivity = await prisma.activity.create({
      data: {
        title: data.title,
        description: data.description || '',
        location: data.location,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        maxPlayers: parseInt(data.maxParticipants) || 10,
        fee: parseFloat(data.fee) || 0,
        status: 'OPEN',
        creator: {
          connect: { larkUserId: userId }
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            larkUserId: true,
          },
        },
      },
    })

    console.log('活动创建成功:', newActivity.id)

    return NextResponse.json({
      activity: {
        ...newActivity,
        maxParticipants: newActivity.maxPlayers,
        participantCount: newActivity.currentPlayers,
      },
      source: 'database'
    })
  } catch (error) {
    console.error('创建活动失败:', error)
    
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      { 
        error: '创建活动失败',
        message: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
