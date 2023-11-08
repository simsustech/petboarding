export async function up(knex) {
  return knex.schema.createTable('booking_service', function (table) {
    table.increments('id').primary()
    table
      .integer('booking_id')
      .unsigned()
      .references('bookings.id')
      .onDelete('CASCADE')
    table
      .integer('service_id')
      .unsigned()
      .references('services.id')
      .onDelete('CASCADE')
    table.text('comments', 'longtext').nullable()
    table.integer('price').nullable()

    table.timestamps(false, true)
  })
}

export async function down(knex) {
  await knex.schema.table('booking_service', function (table) {
    table.dropForeign('booking_id')
    table.dropForeign('service_id')
  })
  return knex.schema.dropTable('booking_service')
}
