import { c } from 'compress-tag'
// import env from '@vitrify/tools/env'
// const host = env.read('VITE_API_HOST') || env.read('API_HOST')

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
