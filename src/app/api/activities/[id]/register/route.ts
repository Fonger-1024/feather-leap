// 活动报名 API - 纯数据库版本
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 备用内存存储 - 与活动API保持同步
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

let nextRegistrationId = 2
let useFallback = false

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session as any).user?.id || (session as any).user?.larkUserId || '1'

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: {
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

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      )
    }

    if (activity.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Activity is not open for registration' },
        { status: 400 }
      )
    }

    // Check if activity is full
    if (activity._count.registrations >= activity.maxParticipants) {
      return NextResponse.json(
        { error: 'Activity is full' },
        { status: 400 }
      )
    }

    // Check if user is already registered
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        activityId: params.id,
        userId: user.id,
        status: {
          in: ['CONFIRMED', 'PENDING'],
        },
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this activity' },
        { status: 400 }
      )
    }

    const registration = await prisma.registration.create({
      data: {
        activityId: params.id,
        userId: user.id,
        status: 'CONFIRMED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error('Error registering for activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { larkUserId: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const registration = await prisma.registration.findFirst({
      where: {
        activityId: params.id,
        userId: user.id,
        status: {
          in: ['CONFIRMED', 'PENDING'],
        },
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    await prisma.registration.update({
      where: { id: registration.id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ message: 'Registration cancelled successfully' })
  } catch (error) {
    console.error('Error cancelling registration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
