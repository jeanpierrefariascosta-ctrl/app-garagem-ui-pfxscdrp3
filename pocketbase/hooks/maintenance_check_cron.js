cronAdd('daily_maintenance_check', '0 0 * * *', () => {
  const vehicles = $app.findRecordsByFilter(
    'vehicles',
    'is_sold = false || is_sold = null',
    '',
    1000,
    0,
  )

  for (const vehicle of vehicles) {
    const userId = vehicle.getString('user')
    const currentKm = vehicle.getInt('km_current')
    const vehicleName = vehicle.getString('brand') + ' ' + vehicle.getString('model')

    let threshold = 500
    let enabled = true
    let preferences = null

    try {
      const settings = $app.findFirstRecordByData('user_alert_settings', 'user', userId)
      enabled = settings.getBool('enabled')
      threshold = parseInt(settings.getString('default_threshold_km') || '500', 10)
      const prefStr = settings.getString('item_preferences')
      if (prefStr) {
        preferences = JSON.parse(prefStr)
      }
    } catch (_) {}

    if (!enabled) continue

    let vmsList = []
    try {
      vmsList = $app.findRecordsByFilter(
        'vehicle_maintenance_status',
        `vehicle = '${vehicle.id}'`,
        '',
        100,
        0,
      )
      $app.expandRecord(vmsList, ['plan_item'])
    } catch (_) {}

    for (const vms of vmsList) {
      const planItem = vms.expandedOne('plan_item')
      if (!planItem) continue

      const itemName = planItem.getString('item_name')

      if (preferences && preferences[itemName] === false) {
        continue
      }

      const intervalKm = planItem.getInt('interval_km')
      const lastDoneKm = vms.getInt('last_done_km')

      if (intervalKm > 0) {
        const targetKm = lastDoneKm + intervalKm
        const diff = targetKm - currentKm

        if (diff <= threshold && diff > -10000) {
          const recentCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
            .toISOString()
            .replace('T', ' ')
          let alreadyNotified = false
          try {
            const existing = $app.findRecordsByFilter(
              'notifications',
              `user = '${userId}' && type = 'maintenance_alert' && created >= '${recentCutoff}'`,
              '',
              100,
              0,
            )
            for (const n of existing) {
              const dataStr = n.getString('data')
              if (dataStr) {
                const data = JSON.parse(dataStr)
                if (data.vehicle_id === vehicle.id && data.item_name === itemName) {
                  alreadyNotified = true
                  break
                }
              }
            }
          } catch (_) {}

          if (!alreadyNotified) {
            const notifCol = $app.findCollectionByNameOrId('notifications')
            const r = new Record(notifCol)
            r.set('user', userId)
            r.set('type', 'maintenance_alert')
            r.set('title', `Seu ${vehicleName} precisa de ${itemName}`)

            let bodyText = diff > 0 ? `Próximo em ${diff} km` : `Atrasado em ${-diff} km`

            r.set('body', bodyText)
            r.set('action_status', 'none')
            r.set('sent_at', new Date().toISOString())
            r.set('data', { vehicle_id: vehicle.id, item_name: itemName, target_km: targetKm })
            $app.save(r)
          }
        }
      }
    }
  }
})
