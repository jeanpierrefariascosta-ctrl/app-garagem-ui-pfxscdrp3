migrate(
  (app) => {
    const collection = new Collection({
      name: 'pre_travel_checklists',
      type: 'base',
      listRule: "@request.auth.id != '' && vehicle.user = @request.auth.id",
      viewRule: "@request.auth.id != '' && vehicle.user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && vehicle.user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && vehicle.user = @request.auth.id",
      fields: [
        {
          name: 'vehicle',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('vehicles').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'items', type: 'json', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_checklists_vehicle ON pre_travel_checklists (vehicle)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('pre_travel_checklists')
    app.delete(collection)
  },
)
