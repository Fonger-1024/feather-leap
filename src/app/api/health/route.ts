// 健康检查API - 用于诊断Vercel部署问题
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'checking',
    environment: process.env.NODE_ENV,
    checks: {
      database: 'checking',
      prisma: 'checking',
      env_vars: 'checking'
    },
    details: {} as Record<string, unknown>
  }

  try {
    // 检查环境变量
    healthCheck.checks.env_vars = process.env.DATABASE_URL ? 'ok' : 'missing'
    healthCheck.details.database_url_exists = !!process.env.DATABASE_URL
    healthCheck.details.nextauth_url = process.env.NEXTAUTH_URL || 'missing'
    healthCheck.details.nextauth_secret_exists = !!process.env.NEXTAUTH_SECRET

    // 检查Prisma Client
    try {
      await prisma.$connect()
      healthCheck.checks.prisma = 'ok'
      healthCheck.details.prisma_version = '6.9.0'
    } catch (prismaError) {
      healthCheck.checks.prisma = 'error'
      healthCheck.details.prisma_error = prismaError instanceof Error ? prismaError.message : 'Unknown prisma error'
    }

    // 检查数据库连接
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`
      healthCheck.checks.database = 'ok'
      healthCheck.details.database_test = result
    } catch (dbError) {
      healthCheck.checks.database = 'error'
      healthCheck.details.database_error = dbError instanceof Error ? dbError.message : 'Unknown database error'
    }

    // 检查用户表
    try {
      const userCount = await prisma.user.count()
      healthCheck.details.user_count = userCount
    } catch (userError) {
      healthCheck.details.user_error = userError instanceof Error ? userError.message : 'Unknown user error'
    }

    // 检查活动表
    try {
      const activityCount = await prisma.activity.count()
      healthCheck.details.activity_count = activityCount
    } catch (activityError) {
      healthCheck.details.activity_error = activityError instanceof Error ? activityError.message : 'Unknown activity error'
    }

    // 整体状态
    const allChecksOk = Object.values(healthCheck.checks).every(check => check === 'ok')
    healthCheck.status = allChecksOk ? 'healthy' : 'unhealthy'

    return NextResponse.json(healthCheck, { 
      status: allChecksOk ? 200 : 503 
    })

  } catch (error) {
    healthCheck.status = 'error'
    healthCheck.details.general_error = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(healthCheck, { status: 500 })
  } finally {
    try {
      await prisma.$disconnect()
    } catch {
      // 忽略断开连接的错误
    }
  }
}
