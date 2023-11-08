export const up = async (knex) => {
  return knex.schema.createTable('booking_status', function (table) {
    table.increments('id').primary()
    table
      .integer('booking_id')
      .unsigned()
      .references('bookings.id')
      .onDelete('CASCADE')
      .notNull()

    table.string('status').nullable()
    table.datetime('modified_at', { useTz: true })
    table.text('pet_ids').default('[]')
    table.date('start_date')
    table.date('end_date')
    table.string('comments').nullable()

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

export const down = async (knex) => {
  knex.schema.table('booking_status', function (table) {
    table.dropForeign('booking_id')
    table.dropForeign('start_time_id')
    table.dropForeign('end_time_id')
  })
  return knex.schema.dropTable('booking_status')
}
