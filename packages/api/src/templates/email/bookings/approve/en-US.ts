import { c } from 'compress-tag'
import env from '@vitrify/tools/env'
const host = env.read('VITE_API_HOST') || env.read('API_HOST')

const subject = c`\\{{#if requiredDownPaymentAmount}}Down payment required! \\{{/if}}Your booking has been approved.`
const body = c`
  <p>
      Dear {{customer.firstName}} {{customer.lastName}},
  </p>
  <p>
      This email is to inform you that the booking from
      <b>{{startDate}} {{startTime}}</b> until
      <b>{{endDate}} {{endTime}}</b> for your pets
      <b>{{pets}}</b>
      has been approved.
  </p>
  <p>
    Please make sure you have read the <a href="https://${host}/information">information page</a>.
  </p>
  \\{{#if requiredDownPaymentAmount}}
  <p style="color:red;">
    This booking requires a down payment. Open the bill with the link below to pay the down payment.
    <br />
    <b>Please make sure that you pay the down payment within {{#if downPaymentPaymentTermDays}}{{downPaymentPaymentTermDays}}{{else}}5{{/if}} days, otherwise your booking will automatically be canceled.</b>
  </p>
  \\{{/if}}
  \\{{#if invoiceUrl}}
    <p>
    <a href="\\{{invoiceUrl}}">Click here to view and pay the bill for this booking.</a>
    </p>
  \\{{/if}}`

export { subject, body }
