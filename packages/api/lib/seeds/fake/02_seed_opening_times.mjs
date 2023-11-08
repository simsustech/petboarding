export const seed = async (knex) => {
  await knex('opening_times').insert([
    {
      name: 'Morning',
      start_day_counted: 1,
      end_day_counted: 0.5,
      days_of_week: '[0,1,2,3,4,5,6]',
      unavailable_holidays: '["01-01"]',
      start_time: '09:00',
      end_time: '10:00'
    },
    {
      name: 'Evening',
      start_day_counted: 0.5,
      end_day_counted: 1.0,
      days_of_week: '[1,2,3,4,5]',
      unavailable_holidays: '["01-01"]',
      start_time: '17:00',
      end_time: '18:00'
    }
  ])
}
