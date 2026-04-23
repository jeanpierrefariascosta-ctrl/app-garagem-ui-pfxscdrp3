migrate(
  (app) => {
    const vehiclesCol = app.findCollectionByNameOrId('vehicles')
    const plansCol = app.findCollectionByNameOrId('maintenance_plans')

    const collection = new Collection({
      name: 'vehicle_maintenance_status',
      type: 'base',
      listRule: "@request.auth.id != '' && vehicle.user = @request.auth.id",
      viewRule: "@request.auth.id != '' && vehicle.user = @request.auth.id",
      createRule: "@request.auth.id != '' && vehicle.user = @request.auth.id",
      updateRule: "@request.auth.id != '' && vehicle.user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && vehicle.user = @request.auth.id",
      fields: [
        {
          name: 'vehicle',
          type: 'relation',
          required: true,
          collectionId: vehiclesCol.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'plan_item',
          type: 'relation',
          required: true,
          collectionId: plansCol.id,
          maxSelect: 1,
        },
        { name: 'last_done_km', type: 'number' },
        { name: 'last_done_date', type: 'date' },
        { name: 'status', type: 'select', values: ['ok', 'upcoming', 'overdue'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_vms_vehicle ON vehicle_maintenance_status (vehicle)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('vehicle_maintenance_status')
    app.delete(collection)
  },
)
