// 活动报名 API - 纯数据库版本
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userId = (session as any).user?.larkUserId || (session as any).user?.id

    // 检查活动是否存在
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: {
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

    if (activity.status !== 'OPEN') {
      return NextResponse.json(
        { error: '活动已关闭报名' },
        { status: 400 }
      )
    }

    if (activity._count.registrations >= activity.maxPlayers) {
      return NextResponse.json(
        { error: '活动人数已满' },
        { status: 400 }
      )
    }

    // 检查是否已经报名
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        activityId: params.id,
        user: { larkUserId: userId },
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: '您已经报名了这个活动' },
        { status: 400 }
      )
    }

    // 创建报名记录
    const registration = await prisma.registration.create({
      data: {
        activity: { connect: { id: params.id } },
        user: { connect: { larkUserId: userId } },
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
    })

    // 更新活动的当前参与人数
    await prisma.activity.update({
      where: { id: params.id },
      data: {
        currentPlayers: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      message: '报名成功',
      registration,
      source: 'database'
    })
  } catch (error) {
    console.error('报名失败:', error)
    return NextResponse.json(
      { error: '报名失败' },
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

    // 查找报名记录
    const registration = await prisma.registration.findFirst({
      where: {
        activityId: params.id,
        user: { larkUserId: userId },
        status: 'REGISTERED',
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: '您没有报名这个活动' },
        { status: 404 }
      )
    }

    // 删除报名记录
    await prisma.registration.delete({
      where: { id: registration.id },
    })

    // 更新活动的当前参与人数
    await prisma.activity.update({
      where: { id: params.id },
      data: {
        currentPlayers: {
          decrement: 1,
        },
      },
    })

    return NextResponse.json({
      message: '取消报名成功',
      source: 'database'
    })
  } catch (error) {
    console.error('取消报名失败:', error)
    return NextResponse.json(
      { error: '取消报名失败' },
      { status: 500 }
    )
  }
}
