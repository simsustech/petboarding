export async function up(knex) {
  return knex.schema.createTable('periods', function (table) {
    table.increments('id').primary()
    table.date('start_date')
    table.date('end_date')
    table.string('type')
    table.string('comments').nullable()
    table.integer('minimum_rating_for_exception').default(0)
    table.timestamps(false, true)
  })
}

export async function down(knex) {
  return knex.schema.dropTable('periods')
}
