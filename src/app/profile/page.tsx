'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthButton } from '@/components/auth'
import { ActivityCard } from '@/components/activity'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, User, Calendar, Trophy } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email?: string
  avatar?: string
  larkUserId: string
  createdAt: string
  createdActivities: Activity[]
  registrations: Array<{
    id: string
    status: string
    createdAt: string
    activity: Activity
  }>
}

interface Activity {
  id: string
  title: string
  description?: string
  location: string
  startTime: string
  endTime: string
  maxParticipants: number
  fee: number
  status: 'OPEN' | 'CLOSED' | 'CANCELLED'
  creator: {
    id: string
    name: string
    avatar?: string
  }
  registrations?: Array<{
    id: string
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
    user: {
      id: string
      name: string
      avatar?: string
    }
  }>
  _count?: {
    registrations: number
  }
}

export default function ProfilePage() {
  const { status } = useSession()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }
    if (status === 'authenticated') {
      fetchUserProfile()
    }
  }, [status, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">加载失败</h1>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  const joinedActivities = userProfile.registrations
    .filter(reg => reg.status === 'CONFIRMED')
    .map(reg => reg.activity)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
              <h1 className="text-xl font-bold text-gray-900">个人中心</h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
              )}
              <div>
                <CardTitle className="text-2xl">{userProfile.name}</CardTitle>
                <CardDescription>
                  {userProfile.email && <div>邮箱: {userProfile.email}</div>}
                  <div>加入时间: {formatDate(new Date(userProfile.createdAt))}</div>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {userProfile.createdActivities.length}
                  </div>
                  <div className="text-sm text-gray-600">创建的活动</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Trophy className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {joinedActivities.length}
                  </div>
                  <div className="text-sm text-gray-600">参与的活动</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <User className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {userProfile.createdActivities.reduce(
                      (total, activity) => total + (activity._count?.registrations || 0),
                      0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">总参与人次</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('created')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'created'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                我创建的活动 ({userProfile.createdActivities.length})
              </button>
              <button
                onClick={() => setActiveTab('joined')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'joined'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                我参与的活动 ({joinedActivities.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Activities List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'created' ? (
            userProfile.createdActivities.length > 0 ? (
              userProfile.createdActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={{
                    ...activity,
                    registrations: activity.registrations || [],
                    _count: activity._count || { registrations: 0 }
                  }}
                  currentUserId={userProfile.id}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 text-lg mb-4">还没有创建任何活动</div>
                <Button onClick={() => router.push('/')}>
                  去创建活动
                </Button>
              </div>
            )
          ) : (
            joinedActivities.length > 0 ? (
              joinedActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={{
                    ...activity,
                    registrations: activity.registrations || [],
                    _count: activity._count || { registrations: 0 }
                  }}
                  currentUserId={userProfile.id}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 text-lg mb-4">还没有参与任何活动</div>
                <Button onClick={() => router.push('/')}>
                  去参与活动
                </Button>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  )
}
