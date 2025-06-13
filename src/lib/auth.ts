// 恢复数据库认证配置
import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import CredentialsProvider from 'next-auth/providers/credentials'

// 模拟用户数据 - 用于演示登录
const mockUsers = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: null,
    larkUserId: 'mock_user_1'
  },
  {
    id: '2', 
    name: '李四',
    email: 'lisi@example.com',
    avatar: null,
    larkUserId: 'mock_user_2'
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com', 
    avatar: null,
    larkUserId: 'mock_user_3'
  }
]

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: 'demo',
      name: '演示登录',
      credentials: {
        username: { 
          label: '用户名', 
          type: 'text', 
          placeholder: '请输入用户名 (张三, 李四, 王五)' 
        }
      },
      async authorize(credentials) {
        if (!credentials?.username) return null
        
        // 查找匹配的用户
        const user = mockUsers.find(u => u.name === credentials.username)
        
        if (user) {
          // 尝试在数据库中创建或获取用户
          try {
            const dbUser = await prisma.user.upsert({
              where: { larkUserId: user.larkUserId },
              update: {
                name: user.name,
                email: user.email,
              },
              create: {
                larkUserId: user.larkUserId,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
              },
            })
            
            return {
              id: dbUser.larkUserId,
              name: dbUser.name,
              email: dbUser.email,
              image: dbUser.avatar,
              larkUserId: dbUser.larkUserId
            }
          } catch (error) {
            console.error('创建用户失败:', error)
            return null
          }
        }
        
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {      if (user) {
        token.larkUserId = (user as { larkUserId?: string }).larkUserId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error - NextAuth session type extension
        session.user.id = token.sub!
        // @ts-expect-error - NextAuth session type extension
        session.user.larkUserId = token.larkUserId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin', // 自定义登录页面
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
