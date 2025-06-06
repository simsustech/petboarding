import { c } from 'compress-tag'
// import env from '@vitrify/tools/env'
// const host = env.read('VITE_API_HOST') || env.read('API_HOST')

const subject = c`Met betrekking tot uw reservering.`
const body = c`<p>
  Beste {{customer.firstName}} {{customer.lastName}},
  </p>`

export { subject, body }
