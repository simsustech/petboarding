export const up = async (knex, Promise) => {
  return knex.schema.createTable('categories', function (table) {
    table.increments('id').primary()
    table.string('species')
    table.integer('order').nullable()
    table.string('name')
    table.integer('price').nullable()
    table.string('product_id').nullable()
    table.timestamps(false, true)
  })
}

export const down = async (knex, Promise) => {
  return knex.schema.dropTable('categories')
}
