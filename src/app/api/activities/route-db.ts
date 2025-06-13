// 支持数据库的活动API（有fallback）
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 备用内存存储（数据库连接失败时使用）
let fallbackActivities: any[] = [
  {
    id: '1',
    title: '周末羽毛球活动',
    description: '欢迎大家参加周末羽毛球活动，一起挥洒汗水！',
    location: '体育中心A馆',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    maxParticipants: 8,
    fee: 30,
    status: 'OPEN',
    creatorId: 'mock_user_1',
    creator: {
      id: 'mock_user_1',
      name: '张三',
      avatar: null
    },
    registrations: [
      {
        id: '1',
        userId: 'mock_user_1',
        status: 'CONFIRMED',
        user: {
          id: 'mock_user_1',
          name: '张三'
        }
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

let nextActivityId = 2
let useFallback = false

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const creatorId = searchParams.get('creatorId')

    // 尝试使用数据库
    if (!useFallback) {
      try {
        const whereClause: any = {}
        
        if (status && status !== 'ALL') {
          whereClause.status = status
        }
        
        if (creatorId) {
          whereClause.creator = { larkUserId: creatorId }
        }

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
                status: 'CONFIRMED',
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
                    status: 'CONFIRMED',
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
          participantCount: activity._count.registrations,
        }))

        return NextResponse.json({ 
          activities: activitiesWithStats,
          total: activitiesWithStats.length,
          source: 'database'
        })
      } catch (dbError) {
        console.warn('数据库连接失败，使用内存存储:', dbError)
        useFallback = true
      }
    }

    // 使用内存存储作为备用
    let filteredActivities = [...fallbackActivities]

    if (status && status !== 'ALL') {
      filteredActivities = filteredActivities.filter(activity => activity.status === status)
    }

    if (creatorId) {
      filteredActivities = filteredActivities.filter(activity => activity.creatorId === creatorId)
    }

    const activitiesWithStats = filteredActivities.map(activity => ({
      ...activity,
      participantCount: activity.registrations.filter((r: any) => r.status === 'CONFIRMED').length
    }))

    return NextResponse.json({ 
      activities: activitiesWithStats,
      total: activitiesWithStats.length,
      source: 'fallback'
    })
  } catch (error) {
    console.error('获取活动列表失败:', error)
    return NextResponse.json(
      { error: '获取活动列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const data = await request.json()
    
    if (!data.title || !data.location || !data.startTime || !data.endTime) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    const userId = (session as any).user?.larkUserId || (session as any).user?.id

    // 尝试使用数据库
    if (!useFallback) {
      try {
        const newActivity = await prisma.activity.create({
          data: {
            title: data.title,
            description: data.description || '',
            location: data.location,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            maxParticipants: parseInt(data.maxParticipants) || 10,
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
            _count: {
              select: {
                registrations: {
                  where: {
                    status: 'CONFIRMED',
                  },
                },
              },
            },
          },
        })

        return NextResponse.json({ 
          activity: {
            ...newActivity,
            participantCount: newActivity._count.registrations,
          },
          source: 'database'
        })
      } catch (dbError) {
        console.warn('数据库创建失败，使用内存存储:', dbError)
        useFallback = true
      }
    }

    // 使用内存存储作为备用
    const newActivity = {
      id: nextActivityId.toString(),
      title: data.title,
      description: data.description || '',
      location: data.location,
      startTime: data.startTime,
      endTime: data.endTime,
      maxParticipants: parseInt(data.maxParticipants) || 10,
      fee: parseFloat(data.fee) || 0,
      status: 'OPEN',
      creatorId: userId,
      creator: {
        id: userId,
        name: session.user.name || '未知用户',
        avatar: session.user.image,
        larkUserId: userId
      },
      registrations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    fallbackActivities.push(newActivity)
    nextActivityId++

    return NextResponse.json({ 
      activity: {
        ...newActivity,
        participantCount: 0
      },
      source: 'fallback'
    })
  } catch (error) {
    console.error('创建活动失败:', error)
    return NextResponse.json(
      { error: '创建活动失败' },
      { status: 500 }
    )
  }
}
