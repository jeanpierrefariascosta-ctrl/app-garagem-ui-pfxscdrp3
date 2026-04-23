migrate(
  (app) => {
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'jpierre_costa@hotmail.com')
    } catch (_) {
      return
    }

    // user_alert_settings
    try {
      app.findFirstRecordByData('user_alert_settings', 'user', user.id)
    } catch (_) {
      const settingsCol = app.findCollectionByNameOrId('user_alert_settings')
      const settings = new Record(settingsCol)
      settings.set('user', user.id)
      settings.set('enabled', true)
      settings.set('default_threshold_km', '500')
      settings.set('item_preferences', { Óleo: true, Filtro: true, Pneus: true })
      app.save(settings)
    }

    const notifCol = app.findCollectionByNameOrId('notifications')

    const notifs = [
      {
        title: 'Seu veículo precisa de Filtro de ar',
        body: 'Filtro de ar próximo em 500 km',
        action_status: 'action_taken',
        read_at: new Date().toISOString(),
        sent_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        title: 'Seu veículo precisa de Óleo',
        body: 'Óleo próximo em 1000 km',
        action_status: 'ignored',
        read_at: new Date().toISOString(),
        sent_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        title: 'Seu veículo precisa de Pneus',
        body: 'Pneus atrasado em 2000 km',
        action_status: 'action_taken',
        read_at: new Date().toISOString(),
        sent_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
      {
        title: 'Seu veículo precisa de Pastilhas de Freio',
        body: 'Pastilhas próximas em 300 km',
        action_status: 'none',
        read_at: '',
        sent_at: new Date().toISOString(),
        data: { vehicle_id: 'fake_id', item_name: 'Pastilhas de Freio', target_km: 50000 },
      },
    ]

    for (const n of notifs) {
      const r = new Record(notifCol)
      r.set('user', user.id)
      r.set('type', 'maintenance_alert')
      r.set('title', n.title)
      r.set('body', n.body)
      r.set('action_status', n.action_status)
      r.set('sent_at', n.sent_at)
      if (n.read_at) {
        r.set('read_at', n.read_at)
      }
      if (n.data) {
        r.set('data', n.data)
      }
      app.save(r)
    }
  },
  (app) => {
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'jpierre_costa@hotmail.com')
    } catch (_) {
      return
    }

    const notifs = app.findRecordsByFilter('notifications', `user = '${user.id}'`, '', 1000, 0)
    for (const n of notifs) {
      app.delete(n)
    }

    try {
      const settings = app.findFirstRecordByData('user_alert_settings', 'user', user.id)
      app.delete(settings)
    } catch (_) {}
  },
)
