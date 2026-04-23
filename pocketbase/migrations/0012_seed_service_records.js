migrate(
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'jpierre_costa@hotmail.com')
      const onix = app.findFirstRecordByFilter('vehicles', "user = {:user} && model = 'Onix'", {
        user: user.id,
      })
      const workshops = app.findRecordsByFilter('workshops', '1=1', '', 10, 0)
      if (workshops.length === 0) return

      const ws1 = workshops[0]
      const ws2 = workshops.length > 1 ? workshops[1] : ws1
      const ws3 = workshops.length > 2 ? workshops[2] : ws1

      const srCol = app.findCollectionByNameOrId('service_records')

      try {
        app.findFirstRecordByFilter('service_records', 'vehicle = {:v}', { v: onix.id })
        return
      } catch (_) {}

      const sr1 = new Record(srCol)
      sr1.set('vehicle', onix.id)
      sr1.set('workshop', ws1.id)
      sr1.set('service_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      sr1.set('km_at_service', onix.get('km_current') - 1000)
      sr1.set('items_done', ['Troca de Óleo', 'Filtro de Óleo', 'Filtro de Ar'])
      sr1.set('total_value', 350.5)
      sr1.set('notes', 'Óleo 5W30 Sintético')
      app.save(sr1)

      const sr2 = new Record(srCol)
      sr2.set('vehicle', onix.id)
      sr2.set('workshop', ws2.id)
      sr2.set('service_date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      sr2.set('km_at_service', onix.get('km_current') - 6000)
      sr2.set('items_done', ['Alinhamento', 'Balanceamento', 'Rodízio de Pneus'])
      sr2.set('total_value', 180.0)
      app.save(sr2)

      const sr3 = new Record(srCol)
      sr3.set('vehicle', onix.id)
      sr3.set('workshop', ws3.id)
      sr3.set('service_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      sr3.set('km_at_service', onix.get('km_current') - 12000)
      sr3.set('items_done', ['Pastilhas de Freio', 'Disco de Freio', 'Fluido de Freio'])
      sr3.set('total_value', 850.0)
      app.save(sr3)
    } catch (err) {
      console.log('Skipping service records seed: ', err.message)
    }
  },
  (app) => {
    const records = app.findRecordsByFilter('service_records', '1=1', '', 100, 0)
    for (const r of records) {
      app.delete(r)
    }
  },
)
