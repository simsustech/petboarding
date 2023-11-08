export async function up(knex) {
  return knex.schema.createTable('kennels', function (table) {
    table.increments('id').primary()
    table.string('name')
    table.string('description').default('')
    table.integer('capacity').nullable()
    table.integer('order').nullable()

    table
      .integer('building_id')
      .unsigned()
      .references('buildings.id')
      .onDelete('CASCADE')

    table.timestamps(false, true)
  })
}

export async function down(knex) {
  await knex.schema.table('kennels', function (table) {
    table.dropForeign('building_id')
  })
  return knex.schema.dropTable('kennels')
}
