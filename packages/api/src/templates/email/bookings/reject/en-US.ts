import { c } from 'compress-tag'
// import env from '@vitrify/tools/env'
// const hostname = env.read('VITE_API_HOSTNAME') || env.read('API_HOSTNAME')

const subject = c`Your booking has been rejected.`
const body = c`<p>
  Dear {{customer.firstName}} {{customer.lastName}},
  </p>
  <p>
    Unfortunately we have to reject your booking from
    <b>{{startDate}} {{startTime}}</b> until
    <b>{{endDate}} {{endTime}}</b> for your pets
    <b>{{pets}}</b>.
  </p>`

export { subject, body }
