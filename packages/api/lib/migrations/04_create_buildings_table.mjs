export async function up(knex) {
  return knex.schema.createTable('buildings', function (table) {
    table.increments('id').primary()
    table.string('name')
    table.string('location')
    table.string('description').default('')
    table.integer('order').nullable()

    table.timestamps(false, true)
  })
}

export async function down(knex) {
  return knex.schema.dropTable('buildings')
}
