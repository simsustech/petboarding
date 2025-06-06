import { c } from 'compress-tag'
// import env from '@vitrify/tools/env'
// const host = env.read('VITE_API_HOST') || env.read('API_HOST')

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
