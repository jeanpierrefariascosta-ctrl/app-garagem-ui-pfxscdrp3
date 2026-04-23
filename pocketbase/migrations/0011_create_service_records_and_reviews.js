migrate(
  (app) => {
    const serviceRecords = new Collection({
      name: 'service_records',
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
          collectionId: app.findCollectionByNameOrId('vehicles').id,
          required: true,
          maxSelect: 1,
        },
        {
          name: 'workshop',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('workshops').id,
          required: true,
          maxSelect: 1,
        },
        {
          name: 'quote',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('quotes').id,
          required: false,
          maxSelect: 1,
        },
        { name: 'service_date', type: 'date', required: true },
        { name: 'km_at_service', type: 'number', required: true },
        { name: 'items_done', type: 'json', required: true },
        { name: 'total_value', type: 'number', required: true },
        { name: 'notes', type: 'text', required: false },
        {
          name: 'nf_file',
          type: 'file',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_service_records_vehicle ON service_records (vehicle)',
        'CREATE INDEX idx_service_records_date ON service_records (service_date DESC)',
      ],
    })
    app.save(serviceRecords)

    const reviews = new Collection({
      name: 'reviews',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
        },
        {
          name: 'workshop',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('workshops').id,
          required: true,
          maxSelect: 1,
        },
        {
          name: 'service_record',
          type: 'relation',
          collectionId: serviceRecords.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
        { name: 'comment', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_reviews_workshop ON reviews (workshop)'],
    })
    app.save(reviews)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('reviews'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('service_records'))
    } catch (_) {}
  },
)
