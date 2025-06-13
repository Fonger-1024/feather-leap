// 临时开发认证配置 - 无需飞书登录
import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// 模拟用户数据
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
  // 注释掉 Prisma adapter，使用内存存储
  // adapter: PrismaAdapter(prisma),
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
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.avatar,
            larkUserId: user.larkUserId
          }
        }
        
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {    async jwt({ token, user }) {
      if (user) {
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
