migrate(
  (app) => {
    const userAlertSettings = new Collection({
      name: 'user_alert_settings',
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
          maxSelect: 1,
        },
        { name: 'enabled', type: 'bool' },
        {
          name: 'default_threshold_km',
          type: 'select',
          values: ['300', '500', '1000'],
          maxSelect: 1,
        },
        { name: 'item_preferences', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_user_alert_settings_user ON user_alert_settings (user)'],
    })
    app.save(userAlertSettings)

    const notifications = new Collection({
      name: 'notifications',
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
        },
        { name: 'type', type: 'select', values: ['maintenance_alert'], maxSelect: 1 },
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'text', required: true },
        { name: 'data', type: 'json' },
        {
          name: 'action_status',
          type: 'select',
          values: ['none', 'action_taken', 'ignored'],
          maxSelect: 1,
        },
        { name: 'read_at', type: 'date' },
        { name: 'sent_at', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_notifications_user_sent ON notifications (user, sent_at DESC)'],
    })
    app.save(notifications)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('notifications'))
    app.delete(app.findCollectionByNameOrId('user_alert_settings'))
  },
)
