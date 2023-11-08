export async function up(knex) {
  return knex.schema.createTable('services', function (table) {
    table.increments('id').primary()
    table.string('name')
    table.string('description').nullable()
    table.integer('list_price')
    table.string('type')
    table.boolean('hidden').default(false)
    table.boolean('disabled').default(false)

    table.timestamps(false, true)
  })
}

export async function down(knex) {
  return knex.schema.dropTable('services')
}
