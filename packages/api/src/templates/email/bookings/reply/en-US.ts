import { c } from 'compress-tag'
// import env from '@vitrify/tools/env'
// const host = env.read('VITE_API_HOST') || env.read('API_HOST')

const subject = c`With regards to your booking.`
const body = c`<p>
  Dear {{customer.firstName}} {{customer.lastName}},
  </p>`

export { subject, body }
