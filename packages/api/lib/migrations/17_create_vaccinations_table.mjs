export async function up(knex) {
  return knex.schema.createTable('vaccinations', function (table) {
    table.increments('id').primary()
    table.binary('image')
    table.date('expiration_date')
    table.specificType('types', 'text ARRAY')
    table.integer('pet_id').unsigned().references('pets.id').onDelete('CASCADE')

    table.timestamps(false, true)
  })
}

export async function down(knex) {
  await knex.schema.table('vaccinations', function (table) {
    table.dropForeign('pet_id')
  })
  return knex.schema.dropTable('vaccinations')
}
