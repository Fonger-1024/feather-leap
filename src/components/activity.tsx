'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Calendar, MapPin, Users, DollarSign, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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

interface ActivityCardProps {
  activity: Activity
  currentUserId?: string
  onRegister?: (activityId: string) => void
  onUnregister?: (activityId: string) => void
}

export function ActivityCard({ activity, currentUserId, onRegister, onUnregister }: ActivityCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const isRegistered = activity.registrations.some(
    reg => reg.user.id === currentUserId && reg.status === 'CONFIRMED'
  )
  const isFull = activity._count.registrations >= activity.maxParticipants
  const isCreator = activity.creator.id === currentUserId

  const handleRegister = async () => {
    if (!onRegister || !currentUserId) return
    setIsLoading(true)
    try {
      await onRegister(activity.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnregister = async () => {
    if (!onUnregister) return
    setIsLoading(true)
    try {
      await onUnregister(activity.id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader onClick={() => router.push(`/activities/${activity.id}`)}>        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{activity.title}</CardTitle>
          <Badge variant={
            activity.status === 'OPEN' ? 'success' :
            activity.status === 'CLOSED' ? 'warning' : 'destructive'
          }>
            {activity.status === 'OPEN' ? '开放报名' :
             activity.status === 'CLOSED' ? '已关闭' : '已取消'}
          </Badge>
        </div>
        {activity.description && (
          <CardDescription className="line-clamp-2">
            {activity.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{formatDate(new Date(activity.startTime))}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>
              {new Date(activity.startTime).toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} - {new Date(activity.endTime).toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="truncate">{activity.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{activity._count.registrations}/{activity.maxParticipants}</span>
          </div>
        </div>

        {activity.fee > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span>{formatCurrency(activity.fee)}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">创建者:</span>
          <div className="flex items-center gap-2">
            {activity.creator.avatar ? (
              <img
                src={activity.creator.avatar}
                alt={activity.creator.name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            )}
            <span className="text-sm font-medium">{activity.creator.name}</span>
          </div>
        </div>

        {currentUserId && !isCreator && activity.status === 'OPEN' && (
          <div className="pt-2">
            {isRegistered ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleUnregister}
                disabled={isLoading}
              >
                {isLoading ? '处理中...' : '取消报名'}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleRegister}
                disabled={isLoading || isFull}
              >
                {isLoading ? '处理中...' : isFull ? '已满员' : '立即报名'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CreateActivityFormProps {
  onSubmit: (data: { 
    title: string; 
    description: string; 
    location: string; 
    startTime: string; 
    endTime: string; 
    maxParticipants: number; 
    fee: number; 
  }) => Promise<void>
  onCancel: () => void
}

export function CreateActivityForm({ onSubmit, onCancel }: CreateActivityFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    maxParticipants: 10,
    fee: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>创建新活动</CardTitle>
        <CardDescription>
          发布一个新的羽毛球活动，邀请其他人参与
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">活动标题 *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="例如：周末羽毛球友谊赛"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">活动描述</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="详细描述活动内容、要求等..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">活动地点 *</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="例如：体育馆3号场地"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">开始时间 *</label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">结束时间 *</label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">最大参与人数</label>
              <Input
                type="number"
                min="1"
                value={formData.maxParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">费用 (元)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.fee}
                onChange={(e) => setFormData(prev => ({ ...prev, fee: parseFloat(e.target.value) }))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? '创建中...' : '创建活动'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
