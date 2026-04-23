import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { getUnreadNotifications, updateNotification } from '@/services/alerts'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'

export function GlobalAlerts() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const shownRef = useRef(false)

  const checkAlerts = async () => {
    if (!user || shownRef.current) return
    try {
      const res = await getUnreadNotifications()
      if (res.items.length > 0) {
        const notif = res.items[0]
        shownRef.current = true

        toast(notif.title, {
          description: notif.body,
          duration: 4000,
          action: {
            label: 'Solicitar Cotação',
            onClick: async () => {
              await updateNotification(notif.id, {
                action_status: 'action_taken',
                read_at: new Date().toISOString(),
              })
              navigate('/cotacao')
            },
          },
          cancel: {
            label: 'Descartar',
            onClick: async () => {
              await updateNotification(notif.id, {
                action_status: 'ignored',
                read_at: new Date().toISOString(),
              })
            },
          },
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    checkAlerts()
  }, [user])

  useRealtime('notifications', (e) => {
    if (e.action === 'create' && e.record.user === user?.id) {
      shownRef.current = false
      checkAlerts()
    }
  })

  return null
}
