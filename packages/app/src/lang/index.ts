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
  }
  customer: {
    title: string
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
      dog: {
        smallCocktail: string
        largeCocktail: string
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
    }
  }
  booking: {
    title: string
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
      cancelled: string
      cancelledoutsideperiod: string
      rejected: string
      standby: string
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
      cancellationReason: string
      openCustomer: string
      openBooking: string
      openPets: string
      possibleDoubleBooking: string
    }
    helpers: {
      status: {
        pending: string
        approved: string
        cancelled: string
        cancelledoutsideperiod: string
        rejected: string
        standby: string
      }
    }
    replies: {
      approve: string
      reject: string
      reply: string
      cancel: string
    }
    validations: {
      fieldRequired: string
      termsAndConditions: string
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
    fields: {
      status: string
    }
    messages: {
      addPets: string
      cancelSelected: string
      verifyCancellation: string
      verifyApproval: string
      verifyRejection: string
      submitted: string
    }
    replies: {
      approve: string
      reject: string
    }
    status: {
      pending: string
      approved: string
      cancelled: string
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
    }
    helpers: {
      dayCountedHint: string
      daysCountedMessage: string
    }
    messages: {
      verifyDeletion: string
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
