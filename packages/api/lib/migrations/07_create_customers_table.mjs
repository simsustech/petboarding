export async function up(knex) {
  return knex.schema
    .createTable('customers', function (table) {
      table.increments('id').primary()
      table.integer('rating').nullable()
      table.string('gender')
      table.string('first_name')
      table.string('last_name')
      table.string('address')
      table.string('postal_code')
      table.string('city')
      table.string('telephone_number')
      table.string('veterinarian')
      table
        .integer('account_id')
        .nullable()
        .unique()
        .unsigned()
        .references('accounts.id')
        .onDelete('SET NULL')
      table.text('comments', 'longtext').nullable()
      table.timestamps(false, true)
    })
    .then(() => {
      return knex.schema.raw(`
    ALTER TABLE customers
      ADD COLUMN fulltext tsvector
        GENERATED ALWAYS AS 
        (to_tsvector('english', 
        coalesce(first_name, '') || ' ' || 
        coalesce(last_name, '') || ' ' ||
        coalesce(city, '' || ' ' ||
        coalesce(address, '') || ' '))) STORED;
    CREATE INDEX customers_fulltext_idx ON customers USING GIN (fulltext);`)
    })
}

export async function down(knex) {
  knex.schema.table('customers', function (table) {
    table.dropForeign('account_id')
  })
  return knex.schema.dropTable('customers')
}
