import { c } from 'compress-tag'
// import env from '@vitrify/tools/env'
// const host = env.read('VITE_API_HOST') || env.read('API_HOST')

const subject = c`Uw reservering is geweigerd.`
const body = c`<p>
  Beste {{customer.firstName}} {{customer.lastName}},
  </p>
  <p>
    Helaas hebben we geen plaats meer beschikbaar van
    <b>{{startDate}} {{startTime}}</b> t/m
    <b>{{endDate}} {{endTime}}</b> voor uw huisdieren
    <b>{{pets}}</b>.
  </p>`

export { subject, body }
