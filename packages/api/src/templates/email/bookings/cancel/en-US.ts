import { c } from 'compress-tag'
// import env from '@vitrify/tools/env'
// const host = env.read('VITE_API_HOST') || env.read('API_HOST')

const subject = c`Your booking has been canceled.`
const body = c`
  <p>
      Dear {{customer.firstName}} {{customer.lastName}},
  </p>
  <p>
      This email is to inform you that the booking from
      <b>{{startDate}} {{startTime}}</b> until
      <b>{{endDate}} {{endTime}}</b> for your pets
      <b>{{pets}}</b>
      has been canceled with the following reason:
      {{reason}}.
      <br />
      Please note that a cancelation fee may apply.
  </p>`

export { subject, body }
