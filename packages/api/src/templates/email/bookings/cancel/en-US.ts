import { c } from 'compress-tag'
// import env from '@vitrify/tools/env'
// const hostname = env.read('VITE_API_HOSTNAME') || env.read('API_HOSTNAME')

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
      Please note that a cancelation fee may apply.
  </p>`

export { subject, body }