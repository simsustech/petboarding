import { c } from 'compress-tag'
// import env from '@vitrify/tools/env'
// const hostname = env.read('VITE_API_HOSTNAME') || env.read('API_HOSTNAME')

const subject = c`Met betrekking tot uw reservering.`
const body = c`<p>
  Beste {{customer.firstName}} {{customer.lastName}},
  </p>`

export { subject, body }
