migrate(
  (app) => {
    const collection = new Collection({
      name: 'vehicles',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'brand', type: 'text', required: true },
        { name: 'model', type: 'text', required: true },
        { name: 'year', type: 'number', required: true, min: 1950, max: 2100 },
        { name: 'km_current', type: 'number', required: true, min: 0 },
        { name: 'plate', type: 'text' },
        { name: 'color', type: 'text' },
        { name: 'is_sold', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_vehicles_user ON vehicles (user)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('vehicles')
    app.delete(collection)
  },
)
