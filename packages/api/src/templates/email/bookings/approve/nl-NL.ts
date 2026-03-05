import { c } from 'compress-tag'
import env from '@vitrify/tools/env'
const host = env.read('VITE_API_HOST') || env.read('API_HOST')

const subject = c`\\{{#if requiredDownPaymentAmount}}Aanbetaling vereist! \\{{/if}}Uw reservering is goedgekeurd.`
const body = c`
  <p>
      Beste {{customer.firstName}} {{customer.lastName}},
  </p>
  <p>
      Deze email is om u te informeren dat uw reservering van
      <b>{{startDate}} {{startTime}}</b> t/m
      <b>{{endDate}} {{endTime}}</b> voor uw huisdieren
      <b>{{pets}}</b>
      is goedgekeurd.
  </p>
  <p>
    Zorg er voor dat u de <a href="https://${host}/information">informatie pagina</a> gelezen hebt.
  </p>
  \\{{#if requiredDownPaymentAmount}}
  <p style="color:red;">
    Deze reservering vereist een aanbetaling. Open de rekening met de link hieronder om de aanbetaling te voldoen.
    <br />
    <b>Zorg er a.u.b. voor dat u de aanbetaling binnen {{#if downPaymentPaymentTermDays}}{{downPaymentPaymentTermDays}}{{else}}5{{/if}} dagen voldoet, anders zal uw reservering automatisch worden geannuleerd.</b>
  </p>
  \\{{/if}}
  \\{{#if invoiceUrl}}
    <p>
    <a href="\\{{invoiceUrl}}">Klik hier om de rekening van deze reservering in te zien en te betalen.</a>
    </p>
  \\{{/if}}`

export { subject, body }
