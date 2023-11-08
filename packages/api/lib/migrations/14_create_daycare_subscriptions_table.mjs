export const up = async (knex, Promise) => {
  return knex.schema.createTable('daycare_subscriptions', function (table) {
    table.increments('id').primary()
    table.string('name')
    table.string('period').nullable()
    table.integer('amount')
    table.string('product_id').nullable()

    table
      .integer('customer_id')
      .unsigned()
      .references('customers.id')
      .onDelete('CASCADE')

    table.timestamps(false, true)
  })
}

export const down = async (knex, Promise) => {
  await knex.schema.table('daycare_subscriptions', function (table) {
    table.dropForeign('customer_id')
  })
  return knex.schema.dropTable('daycare_subscriptions')
}
