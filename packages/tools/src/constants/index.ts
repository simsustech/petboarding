export enum ANNOUNCEMENT_TYPE {
  GENERAL = 'general',
  IMPORTANT = 'important',
  PRIORITY = 'priority',
  URGENT = 'urgent'
}

export const VACCINATION_IMAGE_SIZE = {
  width: 1024,
  height: 768
}

export const VACCINATION_TYPES_DOG = [
  'kennelcough',
  'parvo',
  'hepatitis',
  'distemper',
  'leptospirosis',
  'rabies'
] as const

export const VACCINATION_TYPES_CAT = [
  'panleukopenia',
  'rhinotracheitis',
  'caliciviruses',
  'rabies',
  'leukemia'
] as const

export const VACCINATION_TYPES = {
  dog: VACCINATION_TYPES_DOG,
  cat: VACCINATION_TYPES_CAT
}

export const PET_SPECIES = ['dog', 'cat'] as const

export enum PETBOARDING_ACCOUNT_ROLES {
  ADMINISTRATOR = 'administrator',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  INTERN = 'intern'
}

export enum BOOKING_STATUS {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  STANDBY = 'standby',
  CANCELED = 'canceled',
  CANCELED_OUTSIDE_PERIOD = 'canceledoutsideperiod',
  AWAITING_DOWNPAYMENT = 'awaitingdownpayment'
}

export enum OPENING_TIME_TYPE {
  ALL = 'all',
  ARRIVAL = 'arrival',
  DEPARTURE = 'departure'
}

export enum DAYCARE_DATE_STATUS {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
  STANDBY = 'standby'
}

export enum PERIOD_TYPE {
  UNAVAILABLE_FOR_ALL = 'unavailableforall',
  UNAVAILABLE_FOR_BOOKINGS = 'unavailableforbookings',
  UNAVAILABLE_FOR_DAYCARE = 'unavailablefordaycare'
}

export enum SERVICE_TYPE {
  APPOINTMENT = 'appointment',
  SURCHARGE = 'surcharge'
}

export enum CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS {
  OPEN = 'open',
  PAID = 'paid',
  CANCELED = 'canceled'
}
