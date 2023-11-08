export async function up(knex) {
  return knex.schema.createTable('opening_times', function (table) {
    table.increments('id').primary()
    table.string('name')
    table.decimal('start_day_counted', 2, 1)
    table.decimal('end_day_counted', 2, 1)
    table.text('days_of_week').default('[]')
    table.text('unavailable_holidays').default('[]')
    table.time('start_time').nullable()
    table.time('end_time').nullable()
    table.boolean('disabled').default(false)
    table.timestamps(false, true)
  })
}

export async function down(knex) {
  return knex.schema.dropTable('opening_times')
}
