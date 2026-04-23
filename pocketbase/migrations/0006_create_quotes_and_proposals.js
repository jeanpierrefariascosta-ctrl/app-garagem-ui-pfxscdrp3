migrate(
  (app) => {
    const quotes = new Collection({
      name: 'quotes',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'vehicle',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('vehicles').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'items_requested', type: 'json' },
        {
          name: 'status',
          type: 'select',
          values: ['open', 'in_progress', 'completed', 'expired'],
          maxSelect: 1,
        },
        { name: 'expires_at', type: 'date', required: true },
        { name: 'lat', type: 'number' },
        { name: 'lng', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(quotes)

    const proposals = new Collection({
      name: 'proposals',
      type: 'base',
      listRule: "@request.auth.id != '' && quote.user = @request.auth.id",
      viewRule: "@request.auth.id != '' && quote.user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'quote',
          type: 'relation',
          required: true,
          collectionId: quotes.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'workshop_name', type: 'text', required: true },
        { name: 'total_value', type: 'number', required: true },
        { name: 'estimated_hours', type: 'number' },
        { name: 'items_included', type: 'json' },
        { name: 'notes', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['pending', 'accepted', 'rejected'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(proposals)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('proposals'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('quotes'))
    } catch (_) {}
  },
)
