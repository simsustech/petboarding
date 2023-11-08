export async function up(knex) {
  return knex.schema.createTable('contact_people', function (table) {
    table.increments('id').primary()
    table.string('first_name')
    table.string('last_name')
    table.string('telephone_number')
    table
      .integer('customer_id')
      .unsigned()
      .references('customers.id')
      .onDelete('CASCADE')
    table.timestamps(false, true)
  })
}

export async function down(knex) {
  knex.schema.table('contact_people', function (table) {
    table.dropForeign('customer_id')
  })
  return knex.schema.dropTable('contact_people')
}
