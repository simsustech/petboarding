export interface Language {
  isoName: string
  edit: string
  cancel: string
  serverError: string
  search: string
  open: string
  goTo: string
  administrator: string
  employee: string
  overview: string
  dayOverview: string
  customers: string
  bookings: string
  labels: string
  tbd: string
  pricesSubjectToChange: string
  welcome: string
  privacyPolicy: string
  404: string
  goHome: string
  updateAvailable: string
  refresh: string
  boarding: string
  update: string
  page: string
  next: string
  previous: string
  delete: string
  documentation: string
  add: string
  account: {
    title: string
    fields: {
      email: string
      roles: string
      verified: string
      name: string
    }
    roles: {
      administrator: string
      employee: string
      intern: string
      manager: string
    }
    messages: {
      addRole: string
      removeRole: string
      changeEmailAddress: string
    }
  }
  agenda: {
    title: string
    day: string
    week: string
  }
  availability: {
    title: string
    messages: {
      doesNotApplyToApprovedBookings: string
    }
  }
  configuration: {
    title: string
    loading: string
    errorLoading: string
    periods: string
    emailTemplates: string
    openingTimes: string
    integrations: string
  }
  customer: {
    title: string
    customer: string
    fields: {
      gender: string
      firstName: string
      lastName: string
      postalCode: string
      address: string
      city: string
      telephoneNumber: string
      veterinarian: string
      comments: string
    }
    validations: {
      fieldRequired: string
    }
  }
  contactPerson: {
    title: string
    fields: {
      firstName: string
      lastName: string
      telephoneNumber: string
    }
    validations: {
      fieldRequired: string
    }
    messages: {
      addCustomerDetails: string
    }
  }
  pet: {
    title: string
    fields: {
      species: string
      name: string
      gender: string
      breed: string
      category: string
      sterilized: string
      chemicalSterilizationDate: string
      chipNumber?: string
      birthDate: string
      color: string
      medicines: string
      food: string
      weight: string
      deceased: string
      particularities: string
      comments: string
      insured: string
    }
    species: {
      dog: string
      cat: string
    }
    genders: {
      male: string
      female: string
      other: string
    }
    vaccination: {
      title: string
      expirationDate: string
      expired: string
      missingVaccinations: string
      dog: {
        smallCocktail: string
        largeCocktail: string
        cocktail: string
      }
      types: {
        kennelcough: string
        parvo: string
        hepatitis: string
        distemper: string
        leptospirosis: string
        rabies: string
        panleukopenia: string
        rhinotracheitis: string
        caliciviruses: string
        leukemia: string
      }
    }
    validations: {
      fieldRequired: string
    }
    messages: {
      addCustomerDetails: string
      addContactPeople: string
      chemicalSterilizationDate: string
      noCategoryAssigned: string
      isChemicallySterilized: string
      showVaccinations: string
      vaccinationsMissing: string
      delete: string
    }
    labels: {
      open: string
    }
    food: {
      fields: {
        timesADay: string
        amount: string
        amountUnit: string
        kind: string
      }
      unit: {
        gram: string
        pieces: string
      }
    }
  }
  booking: {
    title: string
    booking: string
    from: string
    until: string
    days: string
    history: string
    arrivals: string
    departures: string
    costs: {
      title: string
      name: string
      price: string
      quantity: string
      discount: string
      total: string
    }
    status: {
      pending: string
      approved: string
      canceled: string
      canceledoutsideperiod: string
      rejected: string
      standby: string
      awaitingdownpayment: string
    }
    fields: {
      startDate: string
      endDate: string
      startTime: string
      endTime: string
      pets: string
      comments: string
      orderId: string
      status: string
      services: string
    }
    messages: {
      addPets: string
      termsAndConditions: string
      viewTermsAndConditions: string
      cancelationReason: string
      openCustomer: string
      openBooking: string
      openPets: string
      isDoubleBooked: string
      cancelDoubleBookings: string
      settleCancelation: string
      bookingModified: string
      changeDaycareToBooking: string
      upcomingBookings: string
      otherBookings: string
      overlapsWithUnavailablePeriod: string
      openInvoice: string
      invoiceSynchronized: string
      submitted: string
      skipDownPayment: string
      unpaidBookings: (days: number) => string
      approvedAfterDownPayment: string
    }
    helpers: {
      status: {
        pending: string
        approved: string
        canceled: string
        canceledoutsideperiod: string
        rejected: string
        standby: string
        awaitingdownpayment: string
      }
    }
    replies: {
      approve: string
      reject: string
      standby: string
      reply: string
      cancel: string
      settleCancelation: string
    }
    validations: {
      fieldRequired: string
      termsAndConditions: string
      approvedAfterDownPayment: string
    }
  }
  service: {
    title: string
    fields: {
      name: string
      description: string
      type: string
      listPrice: string
      price: string
      comments: string
      hidden: string
      disabled: string
    }
    type: {
      appointment: string
      surcharge: string
    }
    helpers: {
      priceHint: string
      hiddenHint: string
    }
    messages: {
      verifyDeletion: string
    }
  }
  daycare: {
    title: string
    daycare: string
    fields: {
      status: string
    }
    messages: {
      addPets: string
      cancelSelected: string
      verifyCancelation: string
      verifyApproval: string
      verifyRejection: string
      verifyStandby: string
      submitted: string
      openPets: string
      addDaycareDates: string
    }
    replies: {
      approve: string
      reject: string
      standby: string
    }
    status: {
      pending: string
      approved: string
      canceled: string
      rejected: string
      standby: string
    }
  }
  occupancy: {
    title: string
  }
  openingTime: {
    fields: {
      name: string
      startTime: string
      startDayCounted: string
      endTime: string
      endDayCounted: string
      daysOfWeek: string
      unavailableHolidays: string
      disabled: string
      type: string
    }
    type: {
      all: string
      arrival: string
      departure: string
    }
    helpers: {
      dayCountedHint: string
      daysCountedMessage: string
    }
    messages: {
      verifyDeletion: string
      noOpeningTimesOnSelectedDate: string
    }
  }
  period: {
    title: string
    fields: {
      startDate: string
      endDate: string
      type: string
      comments: string
      minimumRatingForException: string
    }
    type: {
      unavailableforall: string
      unavailableforbookings: string
      unavailablefordaycare: string
    }
    messages: {
      verifyDeletion: string
    }
  }
  announcement: {
    title: string
    fields: {
      title: string
      message: string
      type: string
      expirationDate: string
    }
    type: {
      general: string
      important: string
      priority: string
      urgent: string
    }
    messages: {
      verifyDeletion: string
    }
  }
  category: {
    title: string
    fields: {
      species: string
      order: string
      name: string
      price: string
      productId: string
    }
    helpers: {
      productIdHint: string
      orderHint: string
    }
    messages: {
      verifyDeletion: string
    }
  }
  categoryPrice: {
    fields: {
      date: string
      listPrice: string
    }
    labels: {
      addPrice: string
    }
    messages: {
      verifyDeletion: string
    }
  }
  information: {
    messages: {
      termsAndConditions: string
      openingTimes: string
      petHealth: string
      vaccinations: string
    }
  }
  daycareSubscription: {
    title: string
    fields: {
      description: string
      numberOfDays: string
      validityPeriod: string
      listPrice: string
    }
    labels: {
      years: string
      months: string
      days: string
    }
    messages: {
      verifyDeletion: string
      addDaycareSubscriptionNotification: string
    }
  }
  customerDaycareSubscription: {
    title: string
    fields: {
      effectiveDate: string
      validityPeriod: string
    }
    labels: {
      overview: string
      purchase: string
      purchaseSubscription: string
      checkout: string
      showAll: string
    }
    messages: {
      daycareSubscriptionRequired: string
      remainingDays: string
      noRemainingDays: string
    }
  }
  errors: {
    invalid_type: ({
      path,
      expected,
      received
    }: {
      path: string
      expected?: string
      received?: string
    }) => string
  }
  building: {
    title: string
    building: string
    fields: {
      name: string
      location: string
      description: string
      order: string
    }
    helpers: {
      orderHint: string
    }
    messages: {
      verifyDeletion: string
    }
  }
  kennel: {
    title: string
    kennel: string
    fields: {
      name: string
      description: string
      order: string
      capacity: string
      building: string
    }
    helpers: {
      orderHint: string
    }
    messages: {
      verifyDeletion: string
    }
  }
  kennellayout: {
    title: string
    labels: {
      date: string
      today: string
      tomorrow: string
    }
    messages: {
      dragAndDrop: string
    }
  }
  financial: {
    title: string
    total: string
    payment: {
      amountDue: string
      amountPaid: string
      amountRefunded: string
    }
  }
}

import type { Ref } from 'vue'
import { ref } from 'vue'
import en from './en-US.js'
export const lang = ref(en)

const locales = import.meta.glob<{ default: Language }>([
  './*.ts',
  '!./index.ts'
])

export const defineLang = (lang: Language) => {
  return lang
}

export const useLang = () => {
  return lang as Ref<Language>
}

let loadingLanguage = false
export const loadLang = async (isoName: string) => {
  if (!loadingLanguage) {
    loadingLanguage = true
    try {
      const data = (await locales[`./${isoName}.ts`]()).default

      if (data) {
        lang.value = data
      }
    } catch (e) {
      if (import.meta.env.DEBUG) console.error(e)
      throw new Error(`[petboarding] Failed to load ${isoName} language file.`)
    }
    loadingLanguage = false
  }
}
