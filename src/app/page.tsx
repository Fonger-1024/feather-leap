'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { AuthButton, SignInCard } from '@/components/auth'
import { ActivityCard, CreateActivityForm } from '@/components/activity'
import { LoadingPage, LoadingCard } from '@/components/ui/loading'
import { Plus, Filter } from 'lucide-react'

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
    user: {
      id: string
      name: string
      avatar?: string
    }
  }>
  _count: {
    registrations: number
  }
}

export default function Home() {  const { data: session, status } = useSession()
  const [activities, setActivities] = useState<Activity[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar?: string } | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchCurrentUser()
    }
    fetchActivities()
  }, [session, status])

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

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities')
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const handleCreateActivity = async (formData: { 
    title: string; 
    description: string; 
    location: string; 
    startTime: string; 
    endTime: string; 
    maxParticipants: number; 
    fee: number; 
  }) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowCreateForm(false)
        await fetchActivities()
      } else {
        const error = await response.json()
        alert(error.error || '创建活动失败')
      }
    } catch (error) {
      console.error('Failed to create activity:', error)
      alert('创建活动失败')
    }
  }

  const handleRegister = async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}/register`, {
        method: 'POST',
      })

      if (response.ok) {
        await fetchActivities()
      } else {
        const error = await response.json()
        alert(error.error || '报名失败')
      }
    } catch (error) {
      console.error('Failed to register:', error)
      alert('报名失败')
    }
  }

  const handleUnregister = async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}/register`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchActivities()
      } else {
        const error = await response.json()
        alert(error.error || '取消报名失败')
      }
    } catch (error) {
      console.error('Failed to unregister:', error)
      alert('取消报名失败')
    }
  }
  if (status === 'loading') {
    return <LoadingPage message="正在加载..." />
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <SignInCard />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                羽毛球活动管理
              </h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showCreateForm ? (
          <CreateActivityForm
            onSubmit={handleCreateActivity}
            onCancel={() => setShowCreateForm(false)}
          />
        ) : (
          <>
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">活动列表</h2>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  筛选
                </Button>
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                创建活动
              </Button>
            </div>

            {/* Activities Grid */}            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    currentUserId={currentUser?.id}
                    onRegister={handleRegister}
                    onUnregister={handleUnregister}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">暂无活动</div>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  创建第一个活动
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
