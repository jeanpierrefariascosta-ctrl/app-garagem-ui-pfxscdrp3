migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let wUser
    try {
      wUser = app.findAuthRecordByEmail('_pb_users_auth_', 'mecanica@silva.com')
    } catch (_) {
      wUser = new Record(users)
      wUser.setEmail('mecanica@silva.com')
      wUser.setPassword('Skip@Pass')
      wUser.setVerified(true)
      wUser.set('name', 'Mecânica Silva')
      wUser.set('role', 'workshop')
      app.save(wUser)
    }

    const workshops = app.findCollectionByNameOrId('workshops')
    let wRecord
    try {
      wRecord = app.findFirstRecordByData('workshops', 'cnpj', '12.345.678/0001-90')
    } catch (_) {
      wRecord = new Record(workshops)
      wRecord.set('user', wUser.id)
      wRecord.set('name', 'Mecânica Silva')
      wRecord.set('cnpj', '12.345.678/0001-90')
      wRecord.set('address', 'Rua das Oficinas, 123')
      wRecord.set('is_active', true)
      wRecord.set('services', ['Motor', 'Suspensão', 'Freios'])
      app.save(wRecord)
    }

    let cUser
    try {
      cUser = app.findAuthRecordByEmail('_pb_users_auth_', 'cliente@teste.com')
    } catch (_) {
      cUser = new Record(users)
      cUser.setEmail('cliente@teste.com')
      cUser.setPassword('Skip@Pass')
      cUser.setVerified(true)
      cUser.set('name', 'Cliente Teste')
      cUser.set('role', 'user')
      app.save(cUser)
    }

    const vehicles = app.findCollectionByNameOrId('vehicles')
    let v1, v2, v3
    try {
      v1 = app.findFirstRecordByData('vehicles', 'plate', 'ABC1234')
    } catch (_) {
      v1 = new Record(vehicles)
      v1.set('user', cUser.id)
      v1.set('brand', 'Chevrolet')
      v1.set('model', 'Onix')
      v1.set('year', 2021)
      v1.set('km_current', 42000)
      v1.set('plate', 'ABC1234')
      app.save(v1)
    }
    try {
      v2 = app.findFirstRecordByData('vehicles', 'plate', 'DEF5678')
    } catch (_) {
      v2 = new Record(vehicles)
      v2.set('user', cUser.id)
      v2.set('brand', 'Hyundai')
      v2.set('model', 'HB20')
      v2.set('year', 2020)
      v2.set('km_current', 35000)
      v2.set('plate', 'DEF5678')
      app.save(v2)
    }
    try {
      v3 = app.findFirstRecordByData('vehicles', 'plate', 'GHI9012')
    } catch (_) {
      v3 = new Record(vehicles)
      v3.set('user', cUser.id)
      v3.set('brand', 'Volkswagen')
      v3.set('model', 'Gol')
      v3.set('year', 2019)
      v3.set('km_current', 28000)
      v3.set('plate', 'GHI9012')
      app.save(v3)
    }

    const quotes = app.findCollectionByNameOrId('quotes')
    const now = new Date()

    try {
      app.findFirstRecordByData('quotes', 'vehicle', v1.id)
    } catch (_) {
      const q1 = new Record(quotes)
      q1.set('user', cUser.id)
      q1.set('vehicle', v1.id)
      q1.set('items_requested', ['Filtro de ar'])
      q1.set('status', 'open')
      const exp1 = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      q1.set('expires_at', exp1.toISOString())
      app.save(q1)

      const q2 = new Record(quotes)
      q2.set('user', cUser.id)
      q2.set('vehicle', v2.id)
      q2.set('items_requested', ['Óleo', 'Filtro'])
      q2.set('status', 'open')
      const exp2 = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      q2.set('expires_at', exp2.toISOString())
      app.save(q2)

      const q3 = new Record(quotes)
      q3.set('user', cUser.id)
      q3.set('vehicle', v3.id)
      q3.set('items_requested', ['Pneus'])
      q3.set('status', 'open')
      const exp3 = new Date(now.getTime() + 30 * 60 * 1000)
      q3.set('expires_at', exp3.toISOString())
      app.save(q3)
    }
  },
  (app) => {},
)
