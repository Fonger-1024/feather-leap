'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthButton } from '@/components/auth'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Calendar, MapPin, Users, DollarSign, Clock, ArrowLeft, Edit, Trash2 } from 'lucide-react'

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
  registrations: Array<{
    id: string
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
    createdAt: string
    user: {
      id: string
      name: string
      avatar?: string
    }
  }>
  comments: Array<{
    id: string
    content: string
    createdAt: string
    user: {
      id: string
      name: string
      avatar?: string
    }
  }>
}

export default function ActivityDetail() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchActivity()
    }
    if (session) {
      fetchCurrentUser()
    }
  }, [params.id, session])

  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setActivity(data)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  const handleRegister = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}/register`, {
        method: 'POST',
      })

      if (response.ok) {
        await fetchActivity()
      } else {
        const error = await response.json()
        alert(error.error || '报名失败')
      }
    } catch (error) {
      console.error('Failed to register:', error)
      alert('报名失败')
    }
  }

  const handleUnregister = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}/register`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchActivity()
      } else {
        const error = await response.json()
        alert(error.error || '取消报名失败')
      }
    } catch (error) {
      console.error('Failed to unregister:', error)
      alert('取消报名失败')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">活动不存在</h1>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  const isRegistered = activity.registrations.some(
    reg => reg.user.id === currentUser?.id && reg.status === 'CONFIRMED'
  )
  const isFull = activity.registrations.filter(reg => reg.status === 'CONFIRMED').length >= activity.maxParticipants
  const isCreator = activity.creator.id === currentUser?.id
  const confirmedRegistrations = activity.registrations.filter(reg => reg.status === 'CONFIRMED')

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
              <h1 className="text-xl font-bold text-gray-900">
                活动详情
              </h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{activity.title}</CardTitle>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                      activity.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                      activity.status === 'CLOSED' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.status === 'OPEN' ? '开放报名' :
                       activity.status === 'CLOSED' ? '已关闭' : '已取消'}
                    </span>
                  </div>
                  {isCreator && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {activity.description && (
                  <div>
                    <h3 className="font-semibold mb-2">活动描述</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{activity.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium">开始时间</div>
                      <div className="text-sm text-gray-600">{formatDate(new Date(activity.startTime))}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium">结束时间</div>
                      <div className="text-sm text-gray-600">{formatDate(new Date(activity.endTime))}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium">活动地点</div>
                      <div className="text-sm text-gray-600">{activity.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium">参与人数</div>
                      <div className="text-sm text-gray-600">
                        {confirmedRegistrations.length}/{activity.maxParticipants}
                      </div>
                    </div>
                  </div>
                </div>

                {activity.fee > 0 && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium">活动费用</div>
                      <div className="text-sm text-gray-600">{formatCurrency(activity.fee)}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="font-medium">创建者</div>
                  <div className="flex items-center gap-2">
                    {activity.creator.avatar ? (
                      <img
                        src={activity.creator.avatar}
                        alt={activity.creator.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    )}
                    <span>{activity.creator.name}</span>
                  </div>
                </div>

                {session && !isCreator && activity.status === 'OPEN' && (
                  <div className="pt-4 border-t">
                    {isRegistered ? (
                      <Button
                        variant="outline"
                        onClick={handleUnregister}
                        className="w-full"
                      >
                        取消报名
                      </Button>
                    ) : (
                      <Button
                        onClick={handleRegister}
                        disabled={isFull}
                        className="w-full"
                      >
                        {isFull ? '已满员' : '立即报名'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Participants */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>参与者 ({confirmedRegistrations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {confirmedRegistrations.length > 0 ? (
                  <div className="space-y-3">
                    {confirmedRegistrations.map((registration) => (
                      <div key={registration.id} className="flex items-center gap-3">
                        {registration.user.avatar ? (
                          <img
                            src={registration.user.avatar}
                            alt={registration.user.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{registration.user.name}</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(new Date(registration.createdAt))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">暂无参与者</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
