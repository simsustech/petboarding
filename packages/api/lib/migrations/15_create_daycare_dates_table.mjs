export const up = async (knex, Promise) => {
  return knex.schema
    .createTable('daycare_dates', function (table) {
      table.increments('id').primary()
      table.date('date')
      table.text('comments', 'longtext').nullable()
      table.string('status')

      table
        .integer('customer_id')
        .unsigned()
        .references('customers.id')
        .onDelete('CASCADE')

      table
        .integer('daycare_subscription_id')
        .unsigned()
        .references('daycare_subscriptions.id')
        .onDelete('CASCADE')
        .nullable()

      table.timestamps(false, true)
    })
    .then(() => {
      return knex.schema.alterTable('daycare_dates', function (t) {
        t.unique(['date', 'customer_id'])
      })
    })
}

export const down = async (knex, Promise) => {
  await knex.schema.table('daycare_dates', function (table) {
    table.dropForeign('customer_id')
    table.dropForeign('daycare_subscription_id')
  })

  await knex.schema.dropTable('daycare_dates_table')
}
