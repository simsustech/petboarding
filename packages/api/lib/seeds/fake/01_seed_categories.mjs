export const seed = async (knex) => {
  await knex('categories').insert([
    {
      species: 'dog',
      order: 1,
      name: 'Small'
    }
  ])
}
