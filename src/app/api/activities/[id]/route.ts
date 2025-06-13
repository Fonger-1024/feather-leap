import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const activity = await prisma.activity.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const data = await request.json()
    const userId = (session as { user: { larkUserId?: string; id?: string } }).user?.larkUserId || (session as { user: { larkUserId?: string; id?: string } }).user?.id

    const activity = await prisma.activity.findUnique({
      where: { id },
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
    }    const updatedActivity = await prisma.activity.update({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userId = (session as { user: { larkUserId?: string; id?: string } }).user?.larkUserId || (session as { user: { larkUserId?: string; id?: string } }).user?.id

    const activity = await prisma.activity.findUnique({
      where: { id },
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
    }    await prisma.activity.delete({
      where: { id }
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
