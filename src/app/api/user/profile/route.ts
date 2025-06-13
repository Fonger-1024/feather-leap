// 用户个人资料 API - 纯数据库版本
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session as { user: { larkUserId?: string; id?: string } }).user?.larkUserId || (session as { user: { larkUserId?: string; id?: string } }).user?.id

    // 直接使用数据库
    const user = await prisma.user.findUnique({
      where: { larkUserId: userId },
      include: {
        activities: {
          include: {
            _count: {
              select: {
                registrations: {
                  where: { status: 'REGISTERED' }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        registrations: {
          where: { status: 'REGISTERED' },
          include: {
            activity: {
              include: {
                creator: {
                  select: {
                    name: true,
                    avatar: true
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
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const createdActivities = user.activities.map(activity => ({
      ...activity,
      maxParticipants: activity.maxPlayers,
      participantCount: activity.currentPlayers
    }))

    const registeredActivities = user.registrations.map(registration => ({
      ...registration.activity,
      maxParticipants: registration.activity.maxPlayers,
      participantCount: registration.activity.currentPlayers,
      registrationStatus: registration.status
    }))

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        larkUserId: user.larkUserId
      },
      stats: {
        totalCreatedActivities: createdActivities.length,
        totalRegisteredActivities: registeredActivities.length
      },
      createdActivities,
      registeredActivities,
      source: 'database'
    })
  } catch (error) {
    console.error('获取用户资料失败:', error)
    return NextResponse.json(
      { error: '获取用户资料失败' },
      { status: 500 }
    )
  }
}