export async function up(knex) {
  return knex.schema.createTable('announcements', function (table) {
    table.increments('id').primary()
    table.string('title')
    table.text('message')
    table.string('type').default('general')
    table.date('expiration_date').nullable()

    table.timestamps(false, true)
  })
}

export async function down(knex) {
  return knex.schema.dropTable('announcements')
}
