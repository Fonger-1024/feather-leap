// 活动API - 纯数据库版本
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const creatorId = searchParams.get('creatorId')

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

    return NextResponse.json({
      activities: activitiesWithStats,
      total: activitiesWithStats.length,
      source: 'database'
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

    const newActivity = await prisma.activity.create({
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
    return NextResponse.json(
      { error: '创建活动失败' },
      { status: 500 }
    )
  }
}
