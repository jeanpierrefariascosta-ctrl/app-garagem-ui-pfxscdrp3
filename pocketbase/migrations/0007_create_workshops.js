migrate(
  (app) => {
    const workshops = new Collection({
      name: 'workshops',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: null,
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'cnpj', type: 'text', required: true },
        { name: 'address', type: 'text' },
        { name: 'lat', type: 'number' },
        { name: 'lng', type: 'number' },
        { name: 'services', type: 'json' },
        { name: 'opening_hours', type: 'text' },
        { name: 'score', type: 'number' },
        { name: 'is_active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(workshops)

    const proposals = app.findCollectionByNameOrId('proposals')
    if (!proposals.fields.getByName('workshop')) {
      proposals.fields.add(
        new RelationField({
          name: 'workshop',
          collectionId: workshops.id,
          maxSelect: 1,
        }),
      )
    }
    proposals.listRule =
      "@request.auth.id != '' && (quote.user = @request.auth.id || workshop.user = @request.auth.id)"
    proposals.viewRule =
      "@request.auth.id != '' && (quote.user = @request.auth.id || workshop.user = @request.auth.id)"
    app.save(proposals)

    const quotes = app.findCollectionByNameOrId('quotes')
    quotes.listRule =
      "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'workshop')"
    quotes.viewRule =
      "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'workshop')"
    app.save(quotes)
  },
  (app) => {
    const proposals = app.findCollectionByNameOrId('proposals')
    proposals.fields.removeByName('workshop')
    proposals.listRule = "@request.auth.id != '' && quote.user = @request.auth.id"
    proposals.viewRule = "@request.auth.id != '' && quote.user = @request.auth.id"
    app.save(proposals)

    const quotes = app.findCollectionByNameOrId('quotes')
    quotes.listRule = "@request.auth.id != '' && user = @request.auth.id"
    quotes.viewRule = "@request.auth.id != '' && user = @request.auth.id"
    app.save(quotes)

    const workshops = app.findCollectionByNameOrId('workshops')
    app.delete(workshops)
  },
)
