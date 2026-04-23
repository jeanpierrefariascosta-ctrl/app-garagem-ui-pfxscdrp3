migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const vehicles = app.findCollectionByNameOrId('vehicles')
    const plans = app.findCollectionByNameOrId('maintenance_plans')
    const statuses = app.findCollectionByNameOrId('vehicle_maintenance_status')

    // 1. Seed User
    let userRecord
    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'ana@garagem.com')
    } catch (_) {
      userRecord = new Record(users)
      userRecord.setEmail('ana@garagem.com')
      userRecord.setPassword('Senha123!')
      userRecord.setVerified(true)
      userRecord.set('name', 'Ana Silva')
      userRecord.set('role', 'user')
      app.save(userRecord)
    }

    // 2. Seed Maintenance Plans
    const models = [
      'Onix',
      'HB20',
      'Gol',
      'Argo',
      'Creta',
      'T-Cross',
      'Compass',
      'Kwid',
      'Strada',
      'Polo',
      'Virtus',
      'Mobi',
      'Ka',
      'Corolla',
      'Hilux',
      'Civic',
      'Renegade',
      'Duster',
      'Tracker',
      'Cronos',
    ]

    const planItems = [
      { name: 'Óleo', km: 5000, days: 180, priority: 'high' },
      { name: 'Filtro de ar', km: 10000, days: 360, priority: 'medium' },
      { name: 'Pneus', km: 20000, days: 720, priority: 'medium' },
    ]

    try {
      app.findFirstRecordByData('maintenance_plans', 'model', 'Onix')
    } catch (_) {
      for (const model of models) {
        for (const item of planItems) {
          const p = new Record(plans)
          p.set('brand', 'Várias') // Simplified for seed
          p.set('model', model)
          p.set('item_name', item.name)
          p.set('interval_km', item.km)
          p.set('interval_days', item.days)
          p.set('priority', item.priority)
          app.save(p)
        }
      }
    }

    // 3. Seed Vehicle
    let vehicleRecord
    try {
      vehicleRecord = app.findFirstRecordByData('vehicles', 'plate', 'ANA1234')
    } catch (_) {
      vehicleRecord = new Record(vehicles)
      vehicleRecord.set('user', userRecord.id)
      vehicleRecord.set('brand', 'Chevrolet')
      vehicleRecord.set('model', 'Onix')
      vehicleRecord.set('year', 2021)
      vehicleRecord.set('km_current', 42000)
      vehicleRecord.set('plate', 'ANA1234')
      app.save(vehicleRecord)
    }

    // 4. Seed Statuses for Ana's Vehicle
    try {
      app.findFirstRecordByData('vehicle_maintenance_status', 'vehicle', vehicleRecord.id)
    } catch (_) {
      // Find Onix plans
      const onixPlans = app.findRecordsByFilter('maintenance_plans', "model = 'Onix'", '', 10, 0)

      for (const plan of onixPlans) {
        const s = new Record(statuses)
        s.set('vehicle', vehicleRecord.id)
        s.set('plan_item', plan.id)

        if (plan.getString('item_name') === 'Filtro de ar') {
          s.set('status', 'overdue')
          s.set('last_done_km', 30000)
        } else if (plan.getString('item_name') === 'Óleo') {
          s.set('status', 'upcoming')
          s.set('last_done_km', 38000)
        } else {
          s.set('status', 'ok')
          s.set('last_done_km', 40000)
        }
        app.save(s)
      }
    }
  },
  (app) => {
    // Revert logic could be implemented here, but for seeds it's often fine to leave empty or delete specific records.
  },
)
