import { c } from 'compress-tag'
import env from '@vitrify/tools/env'
const hostname = env.read('VITE_API_HOSTNAME') || env.read('API_HOSTNAME')

const subject = c`Your booking has been approved\\{{#if requiredDownPaymentAmount}} (down payment required!)\\{{/if}}.`
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
    Please make sure you have read the <a href="https://${hostname}/information">information page</a>.
  </p>
  \\{{#if requiredDownPaymentAmount}}
  <p style="color:red;">
    This booking requires a down payment. Open the bill with the link below to pay the down payment.
    <br />
    <b>If you do not pay the down payment within {{#if downPaymentPaymentTermDays}}{{downPaymentPaymentTermDays}}{{else}}5{{/if}} days your booking will automatically be canceled.</b>
  </p>
  \\{{/if}}
  \\{{#if invoiceUrl}}
    <p>
    <a href="\\{{invoiceUrl}}">Click here to view and pay the bill for this booking.</a>
    </p>
  \\{{/if}}`

export { subject, body }
