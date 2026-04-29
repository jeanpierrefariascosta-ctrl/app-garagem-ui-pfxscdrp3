migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('vehicles')
    if (!col.fields.getByName('photo')) {
      col.fields.add(
        new FileField({
          name: 'photo',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('vehicles')
    if (col.fields.getByName('photo')) {
      col.fields.removeByName('photo')
    }
    app.save(col)
  },
)
