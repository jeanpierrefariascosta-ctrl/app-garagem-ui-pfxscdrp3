migrate(
  (app) => {
    const collection = new Collection({
      name: 'maintenance_plans',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'brand', type: 'text' },
        { name: 'model', type: 'text' },
        { name: 'year_from', type: 'number' },
        { name: 'year_to', type: 'number' },
        { name: 'item_name', type: 'text', required: true },
        { name: 'interval_km', type: 'number' },
        { name: 'interval_days', type: 'number' },
        { name: 'priority', type: 'select', values: ['critical', 'high', 'medium'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_maint_plans_model ON maintenance_plans (model)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('maintenance_plans')
    app.delete(collection)
  },
)
