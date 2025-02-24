import type { Language } from './index.js'

const lang: Language = {
  isoName: 'en-US',
  edit: 'Edit',
  cancel: 'Cancel',
  serverError: 'Something went wrong...',
  search: 'Search...',
  open: 'Open',
  goTo: 'Go to',
  administrator: 'Administrator',
  employee: 'Employee',
  overview: 'Overview',
  dayOverview: 'Day overview',
  customers: 'Customers',
  bookings: 'Bookings boarding',
  labels: 'Labels',
  tbd: 'TBD',
  pricesSubjectToChange: 'Prices subject to change.',
  welcome: 'Welcome',
  privacyPolicy: 'Privacy policy',
  404: 'Oops, this page is not available...',
  goHome: 'Go to home page',
  updateAvailable: 'An update is available.',
  refresh: 'Refresh',
  boarding: 'Boarding',
  update: 'Update',
  page: 'Page',
  next: 'Next',
  previous: 'Previous',
  delete: 'Delete',
  documentation: 'Documentation',
  account: {
    title: 'Account',
    fields: {
      email: 'Email',
      verified: 'Verified',
      roles: 'Roles',
      name: 'Name'
    },
    roles: {
      administrator: 'Administrator',
      employee: 'Employee',
      intern: 'Intern',
      manager: 'Manager'
    },
    messages: {
      addRole: 'Add role',
      removeRole: 'Remove role',
      changeEmailAddress: 'Change email address'
    }
  },
  agenda: {
    title: 'Agenda',
    day: 'Day',
    week: 'Week'
  },
  availability: {
    title: 'Availability',
    messages: {
      doesNotApplyToApprovedBookings:
        'This does not apply to bookings which are already approved!'
    }
  },
  configuration: {
    title: 'Configuration',
    loading: 'Loading configuration',
    errorLoading: 'An error has occured while loading the configuration.',
    periods: 'Periods',
    emailTemplates: 'Email templates',
    openingTimes: 'Opening times',
    integrations: 'Integrations'
  },
  customer: {
    title: 'Customer details',
    customer: 'Customer',
    fields: {
      gender: 'Gender',
      firstName: 'First name',
      lastName: 'Last name',
      postalCode: 'Postal code',
      address: 'Address',
      city: 'City',
      telephoneNumber: 'Telephone number',
      veterinarian: 'Veterinarian',
      comments: 'Comments'
    },
    validations: {
      fieldRequired: 'Field is required'
    }
  },
  contactPerson: {
    title: 'Contact people',
    fields: {
      firstName: 'First name',
      lastName: 'Last name',
      telephoneNumber: 'Telephone number'
    },
    validations: {
      fieldRequired: 'Field is required'
    },
    messages: {
      addCustomerDetails: 'Please enter your customer details first.'
    }
  },
  pet: {
    title: 'Pets',
    fields: {
      species: 'Species',
      name: 'Name',
      gender: 'Gender',
      breed: 'Breed',
      sterilized: 'Sterilized',
      category: 'Category',
      chemicalSterilizationDate: 'Chemical sterilization date',
      chipNumber: 'Chip number',
      birthDate: 'Birth date',
      color: 'Color',
      medicines: 'Medicines',
      food: 'Food',
      weight: 'Weight',
      deceased: 'Deceased',
      particularities: 'Particularities',
      comments: 'Comments',
      insured: 'Pet insurance'
    },
    species: {
      dog: 'Dog',
      cat: 'Cat'
    },
    genders: {
      male: 'Male',
      female: 'Female',
      other: 'Other'
    },
    vaccination: {
      title: 'Vaccinations',
      expirationDate: 'Expiration Date',
      expired: 'Expired',
      missingVaccinations: 'Missing vaccinations',
      dog: {
        smallCocktail: 'Small cocktail',
        largeCocktail: 'Large cocktail',
        cocktail: 'Cocktail'
      },
      types: {
        kennelcough: 'Kennelcough',
        parvo: 'Parvo',
        hepatitis: 'Hepatitis',
        distemper: 'Distemper',
        leptospirosis: 'Leptospirosis',
        rabies: 'Rabies',
        panleukopenia: 'Feline Panleukopenia',
        rhinotracheitis: 'Feline Rhinotracheitis',
        caliciviruses: 'Feline Calicivirus',
        leukemia: 'Feline Leukemia'
      }
    },
    validations: {
      fieldRequired: 'Field is required'
    },
    messages: {
      addCustomerDetails: 'Please enter your customer details first.',
      addContactPeople: 'Please add a contact person first.',
      chemicalSterilizationDate:
        'If your pet has been chemically sterilized, please enter the date at which this has happened.',
      noCategoryAssigned: 'No category has been assigned yet.',
      isChemicallySterilized: 'Pet is chemically sterilized.',
      showVaccinations: 'Show vaccinations',
      vaccinationsMissing:
        'Pet does not have all mandatory vaccinations. Contact your veterinarian and do not forget to bring the passport of your pet.',
      delete:
        'Are you sure you want to delete the following pet? Type the name of the pet in the box below to confirm.'
    },
    labels: {
      open: 'Open pet.'
    },
    food: {
      fields: {
        timesADay: 'Times a day',
        amount: 'Amount',
        amountUnit: 'Unit',
        kind: 'Kind'
      },
      unit: {
        gram: 'gr.',
        pieces: 'pcs'
      }
    }
  },
  booking: {
    title: 'Bookings',
    booking: 'Booking',
    from: 'from',
    until: 'until',
    days: 'days',
    history: 'History',
    arrivals: 'Arrivals',
    departures: 'Departures',
    costs: {
      title: 'Costs',
      name: 'Name',
      price: 'Price',
      quantity: 'Quantity',
      discount: 'Discount',
      total: 'Total'
    },
    status: {
      pending: 'Pending',
      approved: 'Approved',
      canceled: 'Canceled',
      canceledoutsideperiod: 'Canceled outside cancelation period.',
      rejected: 'Rejected',
      standby: 'Reserve list',
      awaitingdownpayment: 'Awaiting down payment'
    },
    fields: {
      startDate: 'Start date',
      endDate: 'End date',
      startTime: 'Start time',
      endTime: 'End time',
      pets: 'Pets',
      comments: 'Comments',
      orderId: 'Order',
      status: 'Status',
      services: 'Services'
    },
    messages: {
      addPets: 'Please add one or more pets first.',
      termsAndConditions: 'I agree to the terms and conditions.',
      viewTermsAndConditions: 'Click here to view the terms and conditions.',
      cancelationReason:
        'Please provide the reason for cancelling the booking.',
      openCustomer: 'Open customer details',
      openBooking: 'Open booking',
      openPets: 'Open pets',
      isDoubleBooked: 'This booking overlaps with another booking or daycare.',
      cancelDoubleBookings:
        'Avoid unnecessary costs and cancel overlapping dates.',
      settleCancelation:
        'Are you sure you want to settle the cancelation of the following booking?',
      bookingModified: 'Booking has been modified.',
      changeDaycareToBooking:
        'If you wish to change a daycare appointment to an overnight stay, cancel the daycare appointment first and then place a booking.',
      upcomingBookings: 'Upcoming bookings',
      otherBookings: 'Other bookings',
      overlapsWithUnavailablePeriod:
        'Booking possibly overlaps with a busy period. Please check your confirmation email.',
      openInvoice: 'Open bill or invoice.',
      invoiceSynchronized: 'Costs of bill or invoice have been synchronized.',
      submitted:
        'Your booking has been submitted. You will receive an confirmation by email. If a down payment is required, please follow the instructions in the email.',
      skipDownPayment: 'Skip down payment',
      unpaidBookings: (days) => `Unpaid bookings of last ${days} days.`,
      approvedAfterDownPayment:
        'If a down payment is required I will make sure to pay by following the instructions in the confirmation email.'
    },
    helpers: {
      status: {
        pending: 'Booking is waiting for approval.',
        approved: 'Booking has been approved.',
        canceled: 'Booking has been canceled.',
        canceledoutsideperiod:
          'Booking has been canceled outside cancelation period.',
        rejected: 'Booking has been rejected.',
        standby: 'Your booking is placed on the reserve list.',
        awaitingdownpayment: 'Awaiting the down payment'
      }
    },
    replies: {
      approve: 'Approve booking',
      reject: 'Reject booking',
      standby: 'Place booking on reserve list',
      reply: 'Reply to booking',
      cancel: 'Cancel booking',
      settleCancelation: 'Settle cancelation'
    },
    validations: {
      fieldRequired: 'Field is required',
      termsAndConditions: 'You need to acccept the terms and conditions.',
      approvedAfterDownPayment: 'You need to accept.'
    }
  },
  service: {
    title: 'Services',
    fields: {
      name: 'Name',
      description: 'Description',
      type: 'Type',
      listPrice: 'Price',
      price: 'Price',
      comments: 'Comments',
      hidden: 'Hidden',
      disabled: 'Disabled'
    },
    type: {
      appointment: 'Appointment',
      surcharge: 'Surcharge'
    },
    helpers: {
      priceHint:
        'Leave the price at 0 to determine the exact price upon usage.',
      hiddenHint: 'Hide the service for customers.'
    },
    messages: {
      verifyDeletion: 'Are you sure you want to delete the following service?'
    }
  },
  daycare: {
    title: 'Daycare',
    daycare: 'Daycare',
    fields: {
      status: 'Status'
    },
    messages: {
      addPets: 'Please add one or more pets first.',
      cancelSelected: 'Cancel selected dates',
      verifyCancelation: 'Are you sure you want to cancel the following dates?',
      verifyApproval: 'Are you sure you want to approve the following dates?',
      verifyRejection: 'Are you sure you want to reject the following dates?',
      verifyStandby:
        'Are you sure you want to place the following dates on the reserve list?',
      submitted:
        'The dates have been submitted. Check the status on this page, you will not receive an email.',
      openPets: 'Open pets',
      addDaycareDates: 'Use the + button at the top to add dates.'
    },
    replies: {
      approve: 'Approve dates',
      reject: 'Reject dates',
      standby: 'Dates on reserve list'
    },
    status: {
      pending: 'Pending',
      approved: 'Approved',
      canceled: 'Canceled',
      rejected: 'Rejected',
      standby: 'Reserve list'
    }
  },
  occupancy: {
    title: 'Occupancy'
  },
  openingTime: {
    fields: {
      name: 'Name',
      startDayCounted: 'Start day counted',
      endDayCounted: 'End day counted',
      daysOfWeek: 'Days of the week',
      unavailableHolidays: 'Unavailable holidays',
      startTime: 'Start time',
      endTime: 'End time',
      disabled: 'Disabled',
      type: 'Type'
    },
    type: {
      all: 'All',
      arrival: 'Arrival',
      departure: 'Departure'
    },
    helpers: {
      dayCountedHint: 'Factor with which the price per day is multiplied.',
      daysCountedMessage:
        'The number of days charged for a booking are all calendar days between start- and end date plus the counted start- and end day. If you wish to only charge for nights, set only the start day counted to 1.'
    },
    messages: {
      verifyDeletion:
        'Are you sure you want to delete the following opening time?',
      noOpeningTimesOnSelectedDate: 'No opening times on selected date.'
    }
  },
  period: {
    title: 'Periods',
    fields: {
      startDate: 'Start date',
      endDate: 'End date',
      type: 'Type',
      comments: 'Comments',
      minimumRatingForException: 'Minimum rating for exception'
    },
    type: {
      unavailableforall: 'No longer available.',
      unavailableforbookings: 'No longer available for bookings.',
      unavailablefordaycare: 'No longer available for daycare.'
    },
    messages: {
      verifyDeletion: 'Are you sure you want to delete the following period?'
    }
  },
  announcement: {
    title: 'Announcements',
    fields: {
      title: 'Title',
      message: 'Message',
      type: 'Type',
      expirationDate: 'Expiration date'
    },
    type: {
      general: 'General',
      important: 'Important',
      priority: 'Priority',
      urgent: 'Urgent'
    },
    messages: {
      verifyDeletion:
        'Are you sure you want to delete the following announcement?'
    }
  },
  category: {
    title: 'Categories',
    fields: {
      species: 'Species',
      order: 'Order',
      name: 'Name',
      price: 'Price',
      productId: 'Product ID'
    },
    helpers: {
      productIdHint: 'The product ID in your e-commerce application.',
      orderHint: 'The order of the item in the categories list.'
    },
    messages: {
      verifyDeletion: 'Are you sure you want to delete the following category?'
    }
  },
  categoryPrice: {
    fields: {
      date: 'Date',
      listPrice: 'Price'
    },
    labels: {
      addPrice: 'Add price'
    },
    messages: {
      verifyDeletion:
        'Are you sure you want to delete the following category price?'
    }
  },
  information: {
    messages: {
      termsAndConditions:
        'Make sure you have read and understand the terms and conditions.',
      openingTimes:
        'Please arrive at the time as is shown in your booking. If you are unable to make it, let us know in time.',
      petHealth:
        'Make sure your pet is in good health, dewormed and treated for fleas and has all mandatory vaccinations.',
      vaccinations: `Do not forget to bring proof of vaccination (the pet's passport)!`
    }
  },
  daycareSubscription: {
    title: 'Daycare subscriptions',
    fields: {
      description: 'Description',
      numberOfDays: 'Number of days',
      validityPeriod: 'Validity period',
      listPrice: 'Price'
    },
    labels: {
      years: 'Years',
      months: 'Months',
      days: 'Days'
    },
    messages: {
      verifyDeletion:
        'Are you sure you want to delete the following daycare subscription?',
      addDaycareSubscriptionNotification:
        'If you add daycare subscriptions, customers will need to purchase a subscription before they can add new daycare dates.'
    }
  },
  customerDaycareSubscription: {
    title: 'Daycare subscriptions',
    fields: {
      effectiveDate: 'Effective date',
      validityPeriod: 'Validity period'
    },
    labels: {
      overview: 'Overview',
      purchase: 'Purchase',
      purchaseSubscription: 'Purchase subscription',
      checkout: 'Checkout'
    },
    messages: {
      daycareSubscriptionRequired:
        'You need to purchase a daycare subscription before you can add daycare dates.',
      remainingDays: 'Remaining days',
      noRemainingDays:
        'You have used all days. Submit the selected dates and then purchase a new daycare subscription to fill in the remaining days.'
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
      `Invalid type in ${path}. ${
        expected && received
          ? `Expected ${expected}, received ${received}.`
          : ''
      }`
  },
  building: {
    title: 'Buildings',
    building: 'Building',
    fields: {
      name: 'Name',
      location: 'Location',
      description: 'Description',
      order: 'Order'
    },
    helpers: {
      orderHint: 'The order of the item in the buildings list.'
    },
    messages: {
      verifyDeletion: 'Are you sure you want to delete the following building?'
    }
  },
  kennel: {
    title: 'Kennels',
    kennel: 'Kennel',
    fields: {
      name: 'Name',
      description: 'Description',
      order: 'Order',
      capacity: 'Capacity',
      building: 'Building'
    },
    helpers: {
      orderHint: 'The order of the item in the kennels list.'
    },
    messages: {
      verifyDeletion: 'Are you sure you want to delete the following kennel?'
    }
  },
  kennellayout: {
    title: 'Kennel layout',
    labels: {
      date: 'Date',
      today: 'Today',
      tomorrow: 'Tomorrow'
    },
    messages: {
      dragAndDrop: 'Drag and drop the pets into the kennels.'
    }
  },
  financial: {
    title: 'Financial',
    total: 'Total',
    payment: {
      amountDue: 'Amount due',
      amountPaid: 'Amount paid',
      amountRefunded: 'Amount refunded'
    }
  }
}

export default lang
