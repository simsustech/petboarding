export const up = async (knex, Promise) => {
  return knex.schema.createTable('bookings', function (table) {
    table.increments('id').primary()
    table.date('start_date')
    table.date('end_date')
    table.text('comments', 'longtext').nullable()
    table.string('order_id').nullable()

    table
      .integer('customer_id')
      .unsigned()
      .references('customers.id')
      .onDelete('CASCADE')
    table
      .integer('start_time_id')
      .unsigned()
      .references('opening_times.id')
      .onDelete('SET NULL')
    table
      .integer('end_time_id')
      .unsigned()
      .references('opening_times.id')
      .onDelete('SET NULL')

    table.timestamps(false, true)
  })
}

export const down = async (knex, Promise) => {
  await knex.schema.table('bookings', function (table) {
    table.dropForeign('customer_id')
    table.dropForeign('start_time_id')
    table.dropForeign('end_time_id')
  })

  await knex.schema.dropTable('bookings')
}
