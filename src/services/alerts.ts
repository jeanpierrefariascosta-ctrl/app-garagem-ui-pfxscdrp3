import pb from '@/lib/pocketbase/client'

export interface UserAlertSettings {
  id?: string
  user: string
  enabled: boolean
  default_threshold_km: '300' | '500' | '1000'
  item_preferences: Record<string, boolean>
}

export interface Notification {
  id: string
  user: string
  type: string
  title: string
  body: string
  data: any
  action_status: 'none' | 'action_taken' | 'ignored'
  read_at: string | null
  sent_at: string
  created: string
}

export const getAlertSettings = async (userId: string) => {
  try {
    return await pb
      .collection('user_alert_settings')
      .getFirstListItem<UserAlertSettings>(`user="${userId}"`)
  } catch (err) {
    return null
  }
}

export const saveAlertSettings = async (data: Partial<UserAlertSettings>) => {
  if (data.id) {
    return pb.collection('user_alert_settings').update(data.id, data)
  }
  return pb.collection('user_alert_settings').create(data)
}

export const getNotifications = async () => {
  return pb.collection('notifications').getFullList<Notification>({
    sort: '-sent_at',
  })
}

export const getUnreadNotifications = async () => {
  return pb.collection('notifications').getList<Notification>(1, 10, {
    filter: 'read_at = ""',
    sort: '-sent_at',
  })
}

export const updateNotification = async (id: string, data: Partial<Notification>) => {
  return pb.collection('notifications').update(id, data)
}
