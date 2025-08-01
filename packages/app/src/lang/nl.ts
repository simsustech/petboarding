import type { Language } from './index.js'

const lang: Language = {
  isoName: 'nl',
  edit: 'Wijzigen',
  cancel: 'Annuleren',
  serverError: 'Er ging iets fout...',
  search: 'Zoeken...',
  open: 'Openen',
  goTo: 'Ga naar',
  administrator: 'Administrator',
  employee: 'Medewerker',
  dayOverview: 'Dag overzicht',
  customers: 'Klanten',
  labels: 'Labels',
  tbd: 'n.o.t.k.',
  pricesSubjectToChange: 'Prijzen onder voorbehoud.',
  welcome: 'Welkom',
  privacyPolicy: 'Privacy verklaring',
  404: 'Oeps, deze pagina is niet beschikbaar...',
  goHome: 'Ga naar home page',
  updateAvailable: 'Er is een update beschikbaar.',
  refresh: 'Vernieuwen',
  boarding: 'Pension',
  update: 'Update',
  page: 'Pagina',
  next: 'Volgende',
  previous: 'Vorige',
  delete: 'Verwijderen',
  documentation: 'Documentatie',
  add: 'Toevoegen',
  darkMode: 'Donkere modus',
  language: 'Taal',
  termsAndConditions: 'Algemene voorwaarden',
  account: {
    title: 'Account',
    fields: {
      email: 'Email',
      verified: 'Geverifieerd',
      roles: 'Rollen',
      name: 'Naam'
    },
    roles: {
      administrator: 'Administrator',
      employee: 'Medewerker',
      intern: 'Stagair',
      manager: 'Manager'
    },
    messages: {
      addRole: 'Rol toevoegen',
      removeRole: 'Rol verwijderen',
      changeEmailAddress: 'Wijzig email adres'
    }
  },
  agenda: {
    title: 'Agenda',
    day: 'Dag',
    week: 'Week'
  },
  availability: {
    title: 'Beschikbaarheid',
    messages: {
      doesNotApplyToApprovedBookings:
        'Dit is niet van toepassing op reeds goedgekeurde reserveringen!',
      addBooking: 'Een reservering toevoegen kan in uw account.'
    }
  },
  configuration: {
    title: 'Configuratie',
    loading: 'Configuratie laden',
    errorLoading:
      'Er is een fout opgetreden bij het laden van de configuratie.',
    periods: 'Periodes',
    emailTemplates: 'Email sjablonen',
    openingTimes: 'Openingstijden',
    integrations: 'Integraties',
    documents: 'Documenten'
  },
  customer: {
    title: 'Klantgegevens',
    customer: 'Klant',
    fields: {
      gender: 'Geslacht',
      firstName: 'Voornaam',
      lastName: 'Achternaam',
      postalCode: 'Postcode',
      address: 'Adres',
      city: 'Woonplaats',
      telephoneNumber: 'Telefoonnummer',
      veterinarian: 'Dierenarts',
      comments: 'Opmerkingen'
    },
    validations: {
      fieldRequired: 'Veld is vereist'
    }
  },
  contactPerson: {
    title: 'Contactpersonen',
    fields: {
      firstName: 'Voornaam',
      lastName: 'Achternaam',
      telephoneNumber: 'Telefoonnummer'
    },
    validations: {
      fieldRequired: 'Veld is vereist'
    },
    messages: {
      addCustomerDetails: 'Vul a.u.b. eerst uw klantgegevens in '
    }
  },
  pet: {
    title: 'Huisdieren',
    fields: {
      species: 'Soort',
      name: 'Naam',
      gender: 'Geslacht',
      breed: 'Ras',
      sterilized: 'Gesteriliseerd',
      category: 'Categorie',
      chemicalSterilizationDate: 'Chemische sterilisatie datum',
      chipNumber: 'Chip nummer',
      birthDate: 'Geboortedatum',
      color: 'Kleur',
      medicines: 'Medicijnen',
      food: 'Voer',
      weight: 'Gewicht',
      deceased: 'Overleden',
      particularities: 'Bijzonderheden',
      comments: 'Opmerkingen',
      insured: 'Huisdierverzekering'
    },
    species: {
      dog: 'Hond',
      cat: 'Kat'
    },
    genders: {
      male: 'Mannelijk',
      female: 'Vrouwelijk',
      other: 'Anders'
    },
    vaccination: {
      title: 'Vaccinaties',
      expirationDate: 'Verloopdatum',
      expired: 'Verlopen',
      missingVaccinations: 'Ontbrekende vaccinaties',
      dog: {
        smallCocktail: 'Kleine cocktail',
        largeCocktail: 'Grote cocktail',
        cocktail: 'Cocktail'
      },
      types: {
        kennelcough: 'Kennelhoest',
        parvo: 'Parvo',
        hepatitis: 'Hepatitis',
        distemper: 'Distemper',
        leptospirosis: 'Leptospirosis',
        rabies: 'Hondsdolheid',
        panleukopenia: 'Kattenziekte',
        rhinotracheitis: 'Rhinotracheitis',
        caliciviruses: 'Calicivirus',
        leukemia: 'Kattenleukemie'
      }
    },
    validations: {
      fieldRequired: 'Veld is vereist'
    },
    messages: {
      addCustomerDetails: 'Vul a.u.b. eerst uw klantgegevens in..',
      addContactPeople: 'Voeg a.u.b. eerst een contact persoon toe',
      chemicalSterilizationDate:
        'Wanneer uw huisdier chemisch is gesteriliseerd, vul dan a.u.b. de datum in wanneer dit is gebeurd.',
      noCategoryAssigned: 'Er is nog geen categorie toegewezen.',
      isChemicallySterilized: 'Huisdier is chemisch gesteriliseerd.',
      showVaccinations: 'Toon vaccinaties',
      vaccinationsMissing:
        'Huisdier heeft niet alle verplichte vaccinaties. Neem contact op met uw dierenarts en vergeet niet het paspoort van uw huisdier mee te nemen.',
      delete:
        'Weet u zeker dat u het volgende huisdier wilt verwijderen? Type hieronder de naam van het huisdier om te bevestigen.',
      foodMoreThanTwoTimesADay: 'Meer dan twee maaltijden per dag.',
      hasMedication: 'Heeft medicatie'
    },
    labels: {
      open: 'Open huisdier.'
    },
    food: {
      fields: {
        timesADay: 'Aantal keer per dag',
        amount: 'Hoeveelheid',
        amountUnit: 'Eenheid',
        kind: 'Soort'
      },
      unit: {
        gram: 'gr',
        pieces: 'st.'
      }
    }
  },
  booking: {
    title: 'Reserveringen',
    booking: 'Reservering',
    from: 'vanaf',
    until: 'tot en met',
    days: 'dagen',
    history: 'Geschiedenis',
    arrivals: 'Aankomst',
    departures: 'Vertrek',
    labels: {
      addBooking: 'Reservering toevoegen'
    },
    costs: {
      title: 'Kosten',
      name: 'Naam',
      price: 'Prijs',
      quantity: 'Hoeveelheid',
      discount: 'Korting',
      total: 'Totaal'
    },
    status: {
      pending: 'Wacht op goedkeuring.',
      approved: 'Goedgekeurd.',
      canceled: 'Geannuleerd.',
      canceledoutsideperiod: 'Geannuleerd buiten annuleringstermijn.',
      rejected: 'Geweigerd.',
      standby: 'Reserve lijst.',
      awaitingdownpayment: 'In afwachting van aanbetaling.'
    },
    fields: {
      startDate: 'Datum brengen',
      endDate: 'Datum halen',
      startTime: 'Tijd brengen',
      endTime: 'Tijd halen',
      pets: 'Huisdieren',
      comments: 'Opmerkingen',
      orderId: 'Order',
      status: 'Status',
      services: 'Diensten'
    },
    messages: {
      addPets: 'Voeg a.u.b. eerst één of meerdere huisdieren toe.',
      termsAndConditions: 'Ik ga akkoord met de algemene voorwaarden.',
      viewTermsAndConditions:
        'Klik hier om de algemene voorwaarden in te zien.',
      cancelationReason:
        'Geef a.u.b. de reden voor het annuleren van de reservering.',
      openCustomer: 'Open klantgegevens',
      openBooking: 'Reservering openen',
      openPets: 'Huisdieren openen',
      isDoubleBooked:
        'Deze reservering overlapt met een andere reservering of dagopvang.',
      cancelDoubleBookings:
        'Voorkom onnodige kosten en annuleer de overlappende datums.',
      settleCancelation:
        'Weet u zeker dat u de annulering van de volgende reservering wilt afhandelen?',
      bookingModified: 'Reservering is gewijzigd.',
      changeDaycareToBooking:
        'Als u een dagopvang afspraak wenst te veranderen in een overnachting, annuleer dan eerst de dagopvang afspraak en plaats dan een reservering.',
      upcomingBookings: 'Komende reserveringen',
      otherBookings: 'Overige reserveringen',
      overlapsWithUnavailablePeriod:
        'Reservering overlapt mogelijk met een drukke periode. Let op uw bevestigings email.',
      openInvoice: 'Open rekening of factuur.',
      invoiceSynchronized:
        'Kosten van rekening of factuur zijn gesynchroniseerd.',
      submitted:
        'Uw reservering is verstuurd. U krijgt een bevestiging per email. Als een aanbetaling is vereist, volg dan a.u.b. de instructies in de email.',
      skipDownPayment: 'Aanbetaling overslaan',
      unpaidBookings: (days) =>
        `Niet betaalde reserveringen van afgelopen ${days} dagen.`,
      approvedAfterDownPayment:
        'Wanneer een aanbetaling is vereist zal ik deze uitsluitend voldoen volgens de instructies in de bevestigingsemail.'
    },
    helpers: {
      status: {
        pending: 'Reservering wacht op goedkeuring.',
        approved: 'Reservering is goedgekeurd.',
        canceled: 'Reservering is geannuleerd.',
        canceledoutsideperiod:
          'Reservering is geannuleerd buiten de annuleringstermijn.',
        rejected: 'Reservering is geweigerd.',
        standby: 'Uw reservering staat op de reserve lijst.',
        awaitingdownpayment: 'In afwachting van de aanbetaling.'
      }
    },
    replies: {
      approve: 'Reservering goedkeuren',
      reject: 'Reservering weigeren',
      standby: 'Reservering op reservelijst plaatsen',
      reply: 'Reactie op reservering',
      cancel: 'Reservering annuleren',
      settleCancelation: 'Annulering afhandelen'
    },
    validations: {
      fieldRequired: 'Veld is vereist',
      termsAndConditions:
        'U dient akkoord te gaan met de algemene voorwaarden.',
      approvedAfterDownPayment: 'U dient akkoord te gaan.'
    }
  },
  bookings: {
    title: 'Reserveringen pension'
  },
  service: {
    title: 'Diensten',
    fields: {
      name: 'Naam',
      description: 'Omschrijving',
      type: 'Type',
      listPrice: 'Prijs',
      price: 'Prijs',
      comments: 'Opmerkingen',
      hidden: 'Verborgen',
      disabled: 'Uitgeschakeld'
    },
    type: {
      appointment: 'Afspraak',
      surcharge: 'Toeslag'
    },
    helpers: {
      priceHint:
        'Laat de prijs op 0 om deze vast te stellen wanneer de dienst gebruikt wordt.',
      hiddenHint: 'Verberg de dienst voor klanten.'
    },
    messages: {
      verifyDeletion: 'Weet u zeker dat u de volgende dienst wilt verwijderen?'
    }
  },
  daycare: {
    title: 'Dagopvang',
    daycare: 'Dagopvang',
    fields: {
      status: 'Status'
    },
    labels: {
      addDaycare: 'Dagopvang toevoegen'
    },
    messages: {
      addPets: 'Voeg a.u.b. eerst één of meerdere huisdieren toe.',
      cancelSelected: 'Annuleer geselecteerde datums',
      verifyCancelation:
        'Weet u zeker dat u de volgende datums wilt annuleren?',
      verifyApproval: 'Weet u zeker dat u de volgende datums wilt goedkeuren?',
      verifyRejection: 'Weet u zeker dat u de volgende datums wilt weigeren?',
      verifyStandby:
        'Weet u zeker dat u de volgende datums op de reserve lijst wil plaatsen?',
      submitted:
        'De datums zijn verstuurd. Controleer de status op deze pagina, u ontvang geen email.',
      openPets: 'Huisdieren openen',
      addDaycareDates: 'Gebruik de + knop bovenaan om datums toe te voegen.'
    },
    replies: {
      approve: 'Datumns goedkeuren',
      reject: 'Datums weigeren',
      standby: 'Datums op reserve lijst'
    },
    status: {
      pending: 'Wacht op goedkeuring.',
      approved: 'Goedgekeurd.',
      canceled: 'Geannuleerd.',
      rejected: 'Geweigerd.',
      standby: 'Reserve lijst'
    }
  },
  occupancy: {
    title: 'Bezetting'
  },
  openingTime: {
    fields: {
      name: 'Naam',
      startDayCounted: 'Start dag geteld',
      endDayCounted: 'Eind dag geteld',
      daysOfWeek: 'Dagen van de week',
      unavailableHolidays: 'Onbeschikbare feestdagen',
      startTime: 'Start tijd',
      endTime: 'Eind tijd',
      disabled: 'Uitgeschakeld',
      type: 'Type'
    },
    type: {
      all: 'Alle',
      arrival: 'Aankomst',
      departure: 'Vertrek'
    },
    helpers: {
      dayCountedHint:
        'Factor met welke de prijs per dag wordt vermenigvuldigt.',
      daysCountedMessage:
        'De dagen geteld voor een reservering zijn alle kalender dagen tussen de start- en eeinddatum plus de getelde start- en einddag. Als u alleen de nachten wil berekenen, vul dan alleen voor start dag geteld 1 in.'
    },
    messages: {
      verifyDeletion:
        'Weet u zeker dat u de volgende openingstijd wilt verwijderen?',
      noOpeningTimesOnSelectedDate:
        'Geen openingstijden op geselecteerde datum.'
    }
  },
  period: {
    title: 'Periodes',
    fields: {
      startDate: 'Start datum',
      endDate: 'Eind datum',
      type: 'Type',
      comments: 'Opmerkingen',
      minimumRatingForException: 'Minimale beoordeling voor uitzonderingen'
    },
    type: {
      unavailableforall: 'Niet langer beschikbaar.',
      unavailableforbookings: 'Niet langer beschikbaar voor reserveringen',
      unavailablefordaycare: 'Niet langer beschikbaar voor dagopvang'
    },
    messages: {
      verifyDeletion: 'Weet u zeker dat u de volgende periode wilt verwijderen?'
    }
  },
  announcement: {
    title: 'Aankondigingen',
    fields: {
      title: 'Titel',
      message: 'Bericht',
      type: 'Type',
      expirationDate: 'Verloopdatum'
    },
    type: {
      general: 'Algemeen',
      important: 'Belangrijk',
      priority: 'Prioriteit',
      urgent: 'Urgent'
    },
    messages: {
      verifyDeletion:
        'Weet u zeker dat u de volgende aankondiging wilt verwijderen?'
    }
  },
  category: {
    title: 'Categorieën',
    fields: {
      species: 'Soort',
      order: 'Volgorde',
      name: 'Naam',
      price: 'Prijs',
      productId: 'Product ID'
    },
    helpers: {
      productIdHint: 'Het product ID in uw e-commerce applicatie.',
      orderHint:
        'De volgorde waarin de categorie in een lijst wordt weergegeven.'
    },
    messages: {
      verifyDeletion:
        'Weet u zeker dat u de volgende categorie wilt verwijderen?'
    }
  },
  categoryPrice: {
    fields: {
      date: 'Datum',
      listPrice: 'Prijs'
    },
    labels: {
      addPrice: 'Prijs toevoegen'
    },
    messages: {
      verifyDeletion:
        'Weet u zeker dat u de volgende categorie prijs wilt verwijderen?'
    }
  },
  information: {
    messages: {
      termsAndConditions:
        'Zorg ervoor dat u op de hoogte bent van de algemene voorwaarden.',
      openingTimes:
        'Kom a.u.b. op de tijd zoals aangegeven in uw reservering. Bent u verhinderd? Laat dit dan op tijd weten.',
      petHealth:
        'Zorg ervoor dat uw hond in goede gezondheid verkeerd, ontwormd en ontvlooid is en alle verplichte vaccinaties heeft.',
      vaccinations:
        'Vergeet niet om het vaccinatie bewijs mee te nemen (het paspoort van uw huisdier)!'
    }
  },
  daycareSubscription: {
    title: 'Dagopvang abonnementen',
    fields: {
      description: 'Omschrijving',
      numberOfDays: 'Aantal dagen',
      validityPeriod: 'Geldigheidsduur',
      listPrice: 'Prijs'
    },
    labels: {
      years: 'Jaren',
      months: 'Maanden',
      days: 'Dagen'
    },
    messages: {
      verifyDeletion:
        'Weet u zeker dat u de volgende dagopvang abonnement wilt verwijderen?',
      addDaycareSubscriptionNotification:
        'Als u dagopvang abonnementen toevoegt moeten klanten eerst een abonnement afnemen voordat zij nieuwe datums kunnen indienen.',
      noActiveSubscriptions:
        'U heeft momenteel geen actieve dagopvang abonnementen.'
    }
  },
  customerDaycareSubscription: {
    title: 'Dagopvang abonnementen',
    fields: {
      effectiveDate: 'Ingangsdatum',
      validityPeriod: 'Geldigheidsduur'
    },
    labels: {
      overview: 'Overzicht',
      purchase: 'Kopen',
      purchaseSubscription: 'Abonnement kopen',
      checkout: 'Afrekenen',
      showAll: 'Toon alle'
    },
    messages: {
      daycareSubscriptionRequired:
        'U dient een dagopvang abonnement af te nemen voordat u dagopvang datums kunt invullen.',
      remainingDays: 'Resterende dagen',
      noRemainingDays:
        'U heeft alle dagen gebruikt. Verzend de geselecteerde datums en koop vervolgens een nieuw dagopvang abonnement om de resterende datums in te vullen.'
    }
  },
  errors: {
    invalid_type: ({
      path,
      expected,
      received
    }: {
      path: string
      expected?: string
      received?: string
    }) =>
      `Ongeldig type in ${path}. ${
        expected && received
          ? `Verwacht ${expected}, ontvangen ${received}.`
          : ''
      }`
  },
  building: {
    title: 'Gebouwen',
    building: 'Gebouw',
    fields: {
      name: 'Naam',
      location: 'Locatie',
      description: 'Omschrijving',
      order: 'Volgorde'
    },
    helpers: {
      orderHint: 'De volgorde waarin het gebouw in een lijst wordt weergegeven.'
    },
    messages: {
      verifyDeletion: 'Weet u zeker dat u het volgende gebouw wilt verwijderen?'
    }
  },
  kennel: {
    title: 'Kennels',
    kennel: 'Kennel',
    fields: {
      name: 'Naam',
      description: 'Omschrijving',
      order: 'Volgorde',
      capacity: 'Capaciteit',
      building: 'Gebouw'
    },
    helpers: {
      orderHint: 'De volgorde waarin de kennel in een lijst wordt weergegeven.'
    },
    messages: {
      verifyDeletion: 'Weet u zeker dat u de volgende kennel wilt verwijderen?'
    }
  },
  kennellayout: {
    title: 'Kennel indeling',
    labels: {
      date: 'Datum',
      today: 'Vandaag',
      tomorrow: 'Morgen'
    },
    messages: {
      dragAndDrop: 'Sleep de huisdieren naar de kennels.'
    }
  },
  financial: {
    title: 'Financieel',
    total: 'Totaal',
    payment: {
      amountDue: 'Te betalen',
      amountPaid: 'Betaald',
      amountRefunded: 'Terugbetaald'
    }
  },
  dashboard: {
    account: {
      menu: {
        title: 'Snelmenu',
        editCustomer: 'Ik wil mijn persoonlijke gegevens wijzigen.',
        editContactPeople: 'Ik wil mijn contactpersonen wijzigen.',
        editPets: 'Ik wil de informatie van mijn huisdier(en) wijzigen.',
        addOrViewBooking: 'Ik wil een reservering toevoegen of bekijken.',
        addOrViewDaycareDates: 'Ik wil dagopvang datums toevoegen of bekijken.'
      }
    }
  },
  overview: {
    title: 'Overzicht'
  }
}

export default lang
