export const up = async (knex) => {
  return knex.schema.createTable('booking_pet_kennel', function (table) {
    table
      .integer('booking_id')
      .unsigned()
      .references('bookings.id')
      .onDelete('CASCADE')
      .notNull()
    table
      .integer('pet_id')
      .unsigned()
      .references('pets.id')
      .onDelete('CASCADE')
      .notNull()
    table
      .integer('kennel_id')
      .unsigned()
      .references('kennels.id')
      .onDelete('SET NULL')
      .nullable()

    table.primary(['booking_id', 'pet_id'])

    table.timestamps(false, true)
  })
}

export const down = async (knex) => {
  knex.schema.table('booking_pet_kennel', function (table) {
    table.dropForeign('booking_id')
    table.dropForeign('pet_id')
    table.dropForeign('kennel_id')
  })
  return knex.schema.dropTable('booking_pet_kennel')
}
