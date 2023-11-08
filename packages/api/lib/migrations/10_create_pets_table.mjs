export async function up(knex) {
  return knex.schema
    .createTable('pets', function (table) {
      table.increments('id').primary()
      table.string('species')
      table.integer('rating').default(0)
      table.binary('image').nullable()
      table.string('chip_number').nullable()
      table.string('name')
      table.string('breed')
      table.string('gender')
      table.boolean('sterilized')
      table.date('chemical_sterilization_date').nullable()
      table.date('birth_date')
      table.string('color').nullable()
      table.string('medicines').nullable()
      table.string('food').nullable()
      table.string('weight').nullable()
      table.boolean('deceased').default(false)
      table.text('particularities').nullable()
      table.text('comments', 'longtext').nullable()

      table
        .integer('customer_id')
        .unsigned()
        .references('customers.id')
        .onDelete('CASCADE')
      table
        .integer('category_id')
        .unsigned()
        .nullable()
        .references('categories.id')
        .onDelete('SET NULL')
      // table
      //   .integer('species_id')
      //   .unsigned()
      //   .nullable()
      //   .references('species.id')
      //   .onDelete('SET NULL')

      table.timestamps(false, true)
    })
    .then(() => {
      return knex.schema.raw(`
        ALTER TABLE pets
          ADD COLUMN fulltext tsvector
            GENERATED ALWAYS AS 
            (to_tsvector('english', 
            coalesce(name, '') || ' ' || 
            coalesce(breed, '') || ' ' ||
            coalesce(chip_number, '' || ' ' ||
            coalesce(color, '') || ' '))) STORED;
        CREATE INDEX pets_fulltext_idx ON pets USING GIN (fulltext);`)
    })
}

export async function down(knex, Promise) {
  knex.schema.table('pets', function (table) {
    table.dropForeign('customer_id')
    table.dropForeign('category_id')
    table.dropForeign('species_id')
  })
  return knex.schema.dropTable('pets')
}
