import c from 'compress-tag'

export const seed = (knex, Promise) => {
  const emailTemplates = [
    {
      name: 'cancelbooking',
      body: c`<p>
      <b>{{customer}}</b> heeft de reservering geannuleerd van
      <b>{{start_date}} {{start_time}}</b> tot en met
      <b>{{end_date}} {{end_time}}</b> voor zijn huisdieren
      <b>{{pets}}</b> met de volgende reden: <br /><br />
      <b>{{reason}}</b>
    </p>`
    },
    {
      name: 'approvebooking',
      subject: 'Uw reservering is goedgekeurd',
      body: c`<h5>Bedankt voor uw reservering.</h5>
      <p>
          Beste {{firstName}} {{lastName}},
      </p>
      <p>
          Deze email is om u te informeren dat uw reservering van
          <b>{{startDate}} {{startTime}}</b> tot en met
          <b>{{endDate}} {{endTime}}</b> voor uw hond(en)
          <b>{{pets}}</b>
          is goedgekeurd.
      </p>`
    },
    {
      name: 'rejectbooking',
      subject: 'Uw reservering is geweigerd.',
      body: c`<p>
        Beste {{firstName}} {{lastName}},
      </p>
      <p>
          Helaas hebben we geen plaats meer beschikbaar van
          <b>{{startDate}} {{startTime}}</b> tot en met
          <b>{{endDate}} {{endTime}}</b> voor uw huisdieren
          <b>{{pets}}</b>.
      </p>`
    },
    {
      name: 'replyBooking',
      subject: 'Met betrekking tot uw reservering.'
    }
  ]
  return knex('email_templates').insert(emailTemplates)
}
