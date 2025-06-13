'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from 'lucide-react'

export default function SignIn() {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsLoading(true)
    try {
      const result = await signIn('demo', {
        username: username.trim(),
        redirect: false
      })

      if (result?.ok) {
        // 登录成功，重定向到主页
        router.push('/')
        router.refresh()
      } else {
        alert('登录失败，请使用有效的用户名（张三、李四、王五）')
      }
    } catch (error) {
      console.error('登录错误:', error)
      alert('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = async (name: string) => {
    setUsername(name)
    setIsLoading(true)
    try {
      const result = await signIn('demo', {
        username: name,
        redirect: false
      })

      if (result?.ok) {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('快速登录错误:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">羽毛球活动管理</CardTitle>
          <CardDescription>
            演示模式 - 选择或输入用户名登录
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !username.trim()}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  登录中...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  登录
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                或快速登录
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['张三', '李四', '王五'].map((name) => (
              <Button
                key={name}
                variant="outline"
                size="sm"
                onClick={() => quickLogin(name)}
                disabled={isLoading}
                className="flex items-center justify-center"
              >
                {name}
              </Button>
            ))}
          </div>

          <div className="text-center text-sm text-gray-500 mt-4">
            <p>这是演示模式，无需真实认证</p>
            <p>飞书登录功能已暂时禁用</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
