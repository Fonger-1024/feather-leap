import { Client } from '@larksuiteoapi/node-sdk'

export const larkClient = new Client({
  appId: process.env.LARK_APP_ID!,
  appSecret: process.env.LARK_APP_SECRET!,
  encryptKey: process.env.LARK_ENCRYPT_KEY,
  verificationToken: process.env.LARK_VERIFICATION_TOKEN,
})

export interface LarkUser {
  sub: string
  name: string
  picture?: string
  email?: string
  mobile?: string
  employee_id?: string
  department_ids?: string[]
}

export async function getLarkUserInfo(accessToken: string): Promise<LarkUser | null> {
  try {
    const response = await larkClient.authen.v1.userInfo({
      params: {
        user_access_token: accessToken,
      },
    })
    
    if (response.code === 0 && response.data) {
      return {
        sub: response.data.sub!,
        name: response.data.name!,
        picture: response.data.picture,
        email: response.data.email,
        mobile: response.data.mobile,
        employee_id: response.data.employee_id,
        department_ids: response.data.department_ids,
      }
    }
    
    return null
  } catch (error) {
    console.error('Failed to get Lark user info:', error)
    return null
  }
}
