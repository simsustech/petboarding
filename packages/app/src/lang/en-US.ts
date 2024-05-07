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
  overview: 'Day overview',
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
    openingTimes: 'Opening times'
  },
  customer: {
    title: 'Customer details',
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
    }
  },
  booking: {
    title: 'Bookings',
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
      cancelled: 'Cancelled',
      cancelledoutsideperiod: 'Cancelled outside cancellation period.',
      rejected: 'Rejected',
      standby: 'Reserve list'
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
      cancellationReason:
        'Please provide the reason for cancelling the booking.',
      openCustomer: 'Open customer details',
      openBooking: 'Open booking',
      openPets: 'Open pets',
      isDoubleBooked: 'This booking overlaps with another booking or daycare.',
      cancelDoubleBookings:
        'Avoid unnecessary costs and cancel overlapping dates.',
      settleCancellation:
        'Are you sure you want to settle the cancellation of the following booking?',
      bookingModified: 'Booking has been modified.',
      changeDaycareToBooking:
        'If you wish to change a daycare appointment to an overnight stay, cancel the daycare appointment first and then place a booking.',
      upcomingBookings: 'Upcoming bookings',
      otherBookings: 'Other bookings'
    },
    helpers: {
      status: {
        pending: 'Booking is waiting for approval.',
        approved: 'Booking has been approved.',
        cancelled: 'Booking has been cancelled.',
        cancelledoutsideperiod:
          'Booking has been cancelled outside cancellation period.',
        rejected: 'Booking has been rejected.',
        standby: 'Your booking is placed on the reserve list.'
      }
    },
    replies: {
      approve: 'Approve booking',
      reject: 'Reject booking',
      standby: 'Place booking on reserve list',
      reply: 'Reply to booking',
      cancel: 'Cancel booking'
    },
    validations: {
      fieldRequired: 'Veld is vereist',
      termsAndConditions: 'You need to acccept the terms and conditions.'
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
    fields: {
      status: 'Status'
    },
    messages: {
      addPets: 'Please add one or more pets first.',
      cancelSelected: 'Cancel selected dates',
      verifyCancellation:
        'Are you sure you want to cancel the following dates?',
      verifyApproval: 'Are you sure you want to approve the following dates?',
      verifyRejection: 'Are you sure you want to reject the following dates?',
      verifyStandby:
        'Are you sure you want to place the following dates on the reserve list?',
      submitted:
        'The dates have been submitted. Check the status on this page, you will not receive an email.',
      openPets: 'Open pets'
    },
    replies: {
      approve: 'Approve dates',
      reject: 'Reject dates',
      standby: 'Dates on reserve list'
    },
    status: {
      pending: 'Pending',
      approved: 'Approved',
      cancelled: 'Cancelled',
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
      disabled: 'Disabled'
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
      priority: 'Priority'
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
  }
}

export default lang
