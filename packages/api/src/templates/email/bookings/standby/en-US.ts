import { c } from 'compress-tag'
// import env from '@vitrify/tools/env'
// const hostname = env.read('VITE_API_HOSTNAME') || env.read('API_HOSTNAME')

const subject = c`Your booking has been placed on the reserve list.`
const body = c`<p>
  Dear {{customer.firstName}} {{customer.lastName}},
</p>
<p>
    Your booking from
    <b>{{startDate}} {{startTime}}</b> until
    <b>{{endDate}} {{endTime}}</b> for your pets
    <b>{{pets}}</b> has been placed on the reserve list.
    We advise you to find an alternative solution.
</p>`

export { subject, body }
