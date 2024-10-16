import { c } from 'compress-tag'
// import env from '@vitrify/tools/env'
// const hostname = env.read('VITE_API_HOSTNAME') || env.read('API_HOSTNAME')

const subject = c`Uw reservering is geannuleerd.`
const body = c`
  <p>
      Beste {{customer.firstName}} {{customer.lastName}},
  </p>
  <p>
      Deze email is om u te informeren dat uw reservering van
      <b>{{startDate}} {{startTime}}</b> tot en met
      <b>{{endDate}} {{endTime}}</b> voor uw huisdieren
      <b>{{pets}}</b>
      is geannuleerd om de volgende reden:
      {{reason}}.
      <br />
      Houdt rekening met eventuele annuleringskosten.
  </p>`

export { subject, body }
