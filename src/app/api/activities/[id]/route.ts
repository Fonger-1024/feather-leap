// 活动详情 API - 纯数据库版本
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 备用内存存储 - 与主活动API保持同步
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
  },
  {
    id: '2',
    title: '羽毛球训练营',
    description: '专业教练指导，提升技术水平',
    location: '体育中心B馆',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    maxParticipants: 12,
    fee: 50,
    status: 'OPEN',
    creatorId: '2',
    creator: {
      id: '2',
      name: '李四',
      avatar: null
    },
    registrations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()  }
]

let useFallback = false

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
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
    })

    if (!activity) {
      return NextResponse.json(
        { error: '活动不存在' },
        { status: 404 }
      )
    }

    const activityWithStats = {
      ...activity,
      maxParticipants: activity.maxPlayers,
      participantCount: activity.currentPlayers,
    }

    return NextResponse.json({ 
      activity: activityWithStats,
      source: 'database'
    })
  } catch (error) {
    console.error('获取活动详情失败:', error)
    return NextResponse.json(
      { error: '获取活动详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const data = await request.json()
    const userId = (session as any).user?.larkUserId || (session as any).user?.id

    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: {
        creator: true
      }
    })

    if (!activity) {
      return NextResponse.json(
        { error: '活动不存在' },
        { status: 404 }
      )
    }

    if (activity.creator.larkUserId !== userId) {
      return NextResponse.json(
        { error: '只有创建者可以编辑活动' },
        { status: 403 }
      )
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        maxPlayers: data.maxParticipants ? parseInt(data.maxParticipants) : undefined,
        fee: data.fee !== undefined ? parseFloat(data.fee) : undefined,
        status: data.status,
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
        ...updatedActivity,
        maxParticipants: updatedActivity.maxPlayers,
        participantCount: updatedActivity.currentPlayers,
      },
      source: 'database'
    })
  } catch (error) {
    console.error('更新活动失败:', error)
    return NextResponse.json(
      { error: '更新活动失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userId = (session as any).user?.larkUserId || (session as any).user?.id

    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: {
        creator: true
      }
    })

    if (!activity) {
      return NextResponse.json(
        { error: '活动不存在' },
        { status: 404 }
      )
    }

    if (activity.creator.larkUserId !== userId) {
      return NextResponse.json(
        { error: '只有创建者可以删除活动' },
        { status: 403 }
      )
    }

    await prisma.activity.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: '活动已删除',
      source: 'database'
    })
  } catch (error) {
    console.error('删除活动失败:', error)
    return NextResponse.json(
      { error: '删除活动失败' },
      { status: 500 }
    )
  }
}
