export const up = async (knex) => {
  return knex.schema.createTable('daycare_date_pet_kennel', function (table) {
    table
      .integer('daycare_date_id')
      .unsigned()
      .references('daycare_dates.id')
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

    table.primary(['daycare_date_id', 'pet_id'])

    table.timestamps(false, true)
  })
}

export const down = async (knex) => {
  await knex.schema.table('daycare_date_pet_kennel', function (table) {
    table.dropForeign('daycare_date_id')
    table.dropForeign('pet_id')
    table.dropForeign('kennel_id')
  })
  return knex.schema.dropTable('daycare_date_pet_kennel')
}
