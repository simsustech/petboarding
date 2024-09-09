import { c } from 'compress-tag'
// import env from '@vitrify/tools/env'
// const hostname = env.read('VITE_API_HOSTNAME') || env.read('API_HOSTNAME')

const subject = c`With regards to your booking.`
const body = c`<p>
  Dear {{customer.firstName}} {{customer.lastName}},
  </p>`

export { subject, body }
