'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, User, Settings } from 'lucide-react'

export function AuthButton() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-md"></div>
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || ''}
              className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
              onClick={() => router.push('/profile')}
            />
          ) : (
            <div
              className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
              onClick={() => router.push('/profile')}
            >
              <User className="w-4 h-4" />
            </div>
          )}
          <span className="text-sm font-medium">{session.user?.name}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          个人中心
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          退出
        </Button>
      </div>
    )
  }
  return (
    <Button onClick={() => signIn('demo')} className="flex items-center gap-2">
      <User className="w-4 h-4" />
      演示登录
    </Button>
  )
}

export function SignInCard() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>欢迎使用羽毛球活动管理</CardTitle>
        <CardDescription>
          演示模式 - 请使用以下用户名登录：张三、李四、王五
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button onClick={() => signIn('demo')} size="lg" className="w-full">
          演示登录
        </Button>
      </CardContent>
    </Card>
  )
}
