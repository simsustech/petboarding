<template>
  <q-page padding>
    <q-markdown :src="content[$q.lang.isoName]" />
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown'
const $q = useQuasar()

const content = ref<Record<string, string>>({
  'en-US': `## Welcome to Petboarding

  ### Registration
  On first use you will have to register an account. Click "Login" and then "Create account" and register your account.

  ### Personal data
  Before you can add bookings or daycare dates, you will have to enter your personal information, the information of a contact person and the information about your pets.
  Make sure the menu on the left hand side is opened by clicking the menu button in the top left corner.

  #### Customer
  Click on "Account" and then "Customer details". Use the edit button at the top to enter your personal details and then click "Submit".

  #### Contact people
  Click on "Contact people" and use the add button at the top to enter the details of a contact person and click "Submit". You can add more than one contact person.

  #### Pets
  Click on "Pets" and use the add button at the top to enter the details about your pet and click "Submit". You can add more than one pet.

  #### Bookings (optional)
  Click on "Bookings" and use the add button at the top to add a new booking. You will first have to select the start- and end date on the calendar. If you selected the wrong dates, you will have to reenter the start- and end date.
  Submit your booking by clicking "Submit". You will only receive an email after your booking has been reviewed.

  #### Daycare dates (optional)
  Click on "Daycare". If the facility requires a daycare subscription you will first have to purchase one by clicking "Purchase subscription".
  You can then add daycare dates by using the add button at the top. You will -not- receive a confirmation but you can check the status on this page.
  `,
  nl: `## Welkom bij Petboarding

  ### Registratie
  Bij eerste gebruik dienst u eerst een account te registreren. Klik op "Inloggen" en dan op "Account aanmaken" en registreer uw account.

  ### Persoonlijke gegevens
  Voordat uw reserveringen of dagopvang datums kunt toevoegen, moet u uw persoonlijke gegevens, de gegevens van een contactpersoon en de gegevens van uw huisdieren invullen.
  Zorg dat het menu aan de linkerkant is geopend door linksboven op de menu knop te klikken.

  #### Klantgegevens
  Klik op "Account" en dan op "Klantgegevens". Klik op de bewerken knop bovenaan om uw persoonlijke gegevens in te vullen en klik vervolgens op "Opslaan".

  #### Contactpersonen
  Klik op "Contactpersonen" en gebruik de toevoegen knop bovenaan om de gegevens van een contactpersoon in te vullen en klik vervolgens op "Opslaan".
  U kunt meer dan één contactpersoon toevoegen.

  #### Huisdieren
  Klik op "Huisdieren" en gebruik de toevoegen knop bovenaan om de gegevens van uw huisdier in te vullen en klik vervolgens op "Opslaan".
  U kunt meer dan één huisdier toevoegen.

  #### Reserveringen (optioneel)
  Klik op "Reserveringen" en gebruik de toevoegen knop bovenaan om een nieuwe reservering toe te voegen. U dient eerst de datum van brengen en halen te selecteren op de kalender.
  Als u de verkeerde datums heeft geselecteerd dient u opnieuw de datum van bregen en halen te selecteren.
  Verstuur uw reservering door te klikken op "Opslaan". U krijgt pas een email nadat de reservering is beoordeeld.

  #### Dagopvang datums (optioneel)
  Klik op "Dagopvang". Als het pension een dagopvang abonnement vereist dient u er eerst een te kopen met de knop "Abonnement kopen".
  U kunt daarna dagopvang datums toevoegen met de toevoegen knop bovenaan. U krijgt -geen- bevestiging maar kunt de status zien op deze pagina.
`
})
</script>
