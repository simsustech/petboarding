import { c } from 'compress-tag'
// import env from '@vitrify/tools/env'
// const host = env.read('VITE_API_HOST') || env.read('API_HOST')

const subject = c`Uw reservering staat op de reserve lijst.`
const body = c`<p>
  Beste {{customer.firstName}} {{customer.lastName}},
</p>
<p>
    Uw reservering van
    <b>{{startDate}} {{startTime}}</b> t/m
    <b>{{endDate}} {{endTime}}</b> voor uw huisdieren
    <b>{{pets}}</b> is op de reserve lijst geplaatst.
    We raden u aan om een alternatief te zoeken.
</p>`

export { subject, body }
