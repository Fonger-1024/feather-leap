import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { getLarkUserInfo } from '@/lib/lark'

// 开发环境模拟用户数据
const mockUsers = [
  {
    id: 'mock_user_1',
    larkUserId: 'mock_lark_1',
    name: '张三（测试）',
    email: 'zhangsan@test.com',
    avatar: null,
  },
  {
    id: 'mock_user_2',
    larkUserId: 'mock_lark_2',
    name: '李四（测试）',
    email: 'lisi@test.com',
    avatar: null,
  },
  {
    id: 'mock_user_3',
    larkUserId: 'mock_lark_3',
    name: '王五（测试）',
    email: 'wangwu@test.com',
    avatar: null,
  }
]

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // 生产环境飞书登录
    ...(process.env.NODE_ENV === 'production' ? [{
      id: 'lark',
      name: 'Lark',
      type: 'oauth',
      authorization: {
        url: 'https://open.feishu.cn/open-apis/authen/v1/authorize',
        params: {
          app_id: process.env.LARK_APP_ID,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/lark`,
          scope: 'contact:user.base:readonly',
          state: 'random_state',
        },
      },
      token: 'https://open.feishu.cn/open-apis/authen/v1/oidc/access_token',
      userinfo: async (tokens) => {
        const userInfo = await getLarkUserInfo(tokens.access_token!)
        return userInfo
      },
      clientId: process.env.LARK_APP_ID,
      clientSecret: process.env.LARK_APP_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }] : []),
    
    // 开发环境模拟登录
    ...(process.env.NODE_ENV === 'development' ? [
      CredentialsProvider({
        id: 'dev-mock',
        name: '开发模式登录',
        credentials: {
          userId: { 
            label: "选择测试用户", 
            type: "select",
            options: mockUsers.map(user => ({ value: user.id, label: user.name }))
          }
        },
        async authorize(credentials) {
          if (!credentials?.userId) return null
          
          const mockUser = mockUsers.find(user => user.id === credentials.userId)
          if (!mockUser) return null

          return {
            id: mockUser.larkUserId,
            name: mockUser.name,
            email: mockUser.email,
            image: mockUser.avatar,
          }
        }
      })
    ] : [])
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.larkUserId = user.id
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.larkUserId as string
        session.accessToken = token.accessToken as string
        session.provider = token.provider as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      try {
        // 对于开发模式，直接创建或更新用户
        if (account?.provider === 'dev-mock') {
          const mockUser = mockUsers.find(u => u.larkUserId === user.id)
          if (mockUser) {
            await prisma.user.upsert({
              where: { larkUserId: user.id },
              update: {
                name: user.name || '',
                email: user.email,
                avatar: user.image,
              },
              create: {
                larkUserId: user.id,
                name: user.name || '',
                email: user.email,
                avatar: user.image,
              },
            })
          }
          return true
        }
        
        // 飞书登录逻辑
        if (account?.provider === 'lark' && profile) {
          await prisma.user.upsert({
            where: { larkUserId: user.id },
            update: {
              name: user.name || '',
              email: user.email,
              avatar: user.image,
            },
            create: {
              larkUserId: user.id,
              name: user.name || '',
              email: user.email,
              avatar: user.image,
            },
          })
          return true
        }
        
        return true
      } catch (error) {
        console.error('Error saving user:', error)
        return false
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
