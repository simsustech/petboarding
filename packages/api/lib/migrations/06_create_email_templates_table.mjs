export const up = (knex) => {
  return knex.schema.createTable('email_templates', function (table) {
    table.increments('id').primary()
    table.string('name')
    table.string('subject')
    table.text('body', 'longtext')
  })
}

export const down = (knex) => {
  return knex.schema.dropTable('email_templates')
}
