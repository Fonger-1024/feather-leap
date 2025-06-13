import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
// 临时注释掉数据库相关导入
// import { PrismaAdapter } from '@next-auth/prisma-adapter'
// import { prisma } from '@/lib/db'
// import { getLarkUserInfo } from '@/lib/lark'
import CredentialsProvider from 'next-auth/providers/credentials'

// 模拟用户数据 - 临时开发用
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
  // 临时注释掉数据库适配器
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
    
    // 临时注释掉飞书登录
    /*
    {
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
    },
    */
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.larkUserId = user.larkUserId || user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.larkUserId as string || token.sub!
        // @ts-ignore
        session.user.larkUserId = token.larkUserId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
