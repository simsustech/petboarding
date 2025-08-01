import type { JSONColumnType, ColumnType } from 'kysely'
import type {
  AccountsTable,
  OidcPayloadsTable,
  AuthenticationMethodsTable
} from '@modular-api/fastify-oidc/kysely'

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

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export type Json = ColumnType<JsonValue, string, string>

export type JsonArray = JsonValue[]

export type JsonObject = {
  [K in string]?: JsonValue
}

export type JsonPrimitive = boolean | null | number | string

export type JsonValue = JsonArray | JsonObject | JsonPrimitive

export type Numeric = ColumnType<number, string | number, string | number>

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface Announcements {
  id: Generated<number>
  title: string
  message: string
  type: string
  expirationDate: string | null
  createdAt: Generated<string>
}

// export interface AuthenticationMethods {
//   id: Generated<number>
//   accountId: number
//   provider: string | null
//   sub: string | null
//   password: string | null
//   otp: string | null
//   otpExpirationDate: Timestamp | null
//   createdAt: Generated<string>
// }

export interface BookingPetKennel {
  bookingId: number
  petId: number
  kennelId: number | null
}

export interface Bookings {
  id: Generated<number>
  startDate: string
  endDate: string
  startTimeId: number
  endTimeId: number
  comments: string | null
  customerId: number
  invoiceUuid: string | null
  createdAt: Generated<string>
}

export interface BookingService {
  id: Generated<number>
  bookingId: number
  serviceId: number
  comments: string | null
  price: number | null
  createdAt: Generated<string>
}

export interface BookingStatus {
  id: Generated<number>
  bookingId: number
  status: BOOKING_STATUS
  modifiedAt: string
  petIds: JSONColumnType<number[]>
  startDate: string
  endDate: string
  startTimeId: number
  endTimeId: number
  comments: string | null
  createdAt: Generated<string>
}

export interface Buildings {
  id: Generated<number>
  name: string
  location: string
  description: string
  order: number | null
  createdAt: Generated<string>
}

export interface Categories {
  id: Generated<number>
  species: string
  name: string
  price: number | null
  order: number | null
  createdAt: Generated<string>
}

export interface CategoryPrices {
  id: Generated<number>
  categoryId: number
  date: string
  listPrice: number
  createdAt: Generated<string>
}

export interface ContactPeople {
  id: Generated<number>
  firstName: string
  lastName: string
  telephoneNumber: string
  customerId: number
  createdAt: Generated<string>
}

export interface Customers {
  id: Generated<number>
  rating: number | null
  gender: 'male' | 'female' | 'other'
  firstName: string
  lastName: string
  address: string
  postalCode: string
  city: string
  telephoneNumber: string
  veterinarian: string
  accountId: number | null
  comments: string | null
  createdAt: Generated<string>
  fulltext: Generated<string | null>
}

export interface DaycareDatePetKennel {
  daycareDateId: number
  petId: number
  kennelId: number | null
}

export interface DaycareDates {
  id: Generated<number>
  date: string
  comments: string | null
  status: DAYCARE_DATE_STATUS
  customerId: number
  customerDaycareSubscriptionId: number | null
  createdAt: Generated<string>
}

export enum CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS {
  OPEN = 'open',
  PAID = 'paid',
  CANCELED = 'canceled'
}

export interface DaycareSubscriptions {
  id: Generated<number>
  description: string
  numberOfDays: number
  validityPeriod: JSONColumnType<{
    years: number
    months: number
    days: number
  }>
  listPrice: number
  createdAt: Generated<string>
}

export interface CustomerDaycareSubscriptions {
  id: Generated<number>
  effectiveDate: string
  expirationDate: string
  status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS
  invoiceUuid: string | null
  daycareSubscriptionId: number
  customerId: number
  createdAt: Generated<string>
}

export interface EmailTemplates {
  id: Generated<number>
  name: string
  subject: string | null
  body: string | null
  createdAt: Generated<string>
}

export interface Kennels {
  id: Generated<number>
  buildingId: number | null
  name: string
  description: string | null
  capacity: number | null
  order: number | null
  createdAt: Generated<string>
}

// export interface OidcPayloads {
//   id: string
//   type: number
//   payload: string | null
//   grantId: string | null
//   userCode: string | null
//   uid: string | null
//   expiresAt: Timestamp | null
//   consumedAt: Timestamp | null
// }

export interface OpeningTimes {
  id: Generated<number>
  name: string
  startDayCounted: Numeric
  endDayCounted: Numeric
  daysOfWeek: JSONColumnType<number[]>
  unavailableHolidays: JSONColumnType<string[]>
  startTime: string
  endTime: string
  disabled: Generated<boolean | null>
  type: OPENING_TIME_TYPE
  createdAt: Generated<string>
}

export interface Periods {
  id: Generated<number>
  startDate: string
  endDate: string
  type: PERIOD_TYPE
  comments: string | null
  minimumRatingForException: Generated<number | null>
  createdAt: Generated<string>
}

export interface Pets {
  id: Generated<number>
  species: string
  rating: Generated<number | null>
  image: Buffer | null
  chipNumber: string | null
  name: string
  breed: string
  gender: string
  sterilized: boolean
  birthDate: string
  chemicalSterilizationDate: string | null
  color: string | null
  medicines: string | null
  food: {
    timesADay: number
    amount: number
    amountUnit: 'gram' | 'pieces'
    kind: string
  } | null
  weight: string | null
  deceased: Generated<boolean | null>
  insured: boolean | null
  particularities: string | null
  comments: string | null
  customerId: number
  categoryId: number | null
  createdAt: Generated<string>
  fulltext: Generated<string | null>
}

export interface Services {
  id: Generated<number>
  name: string
  description: string | null
  listPrice: number | null
  type: SERVICE_TYPE
  hidden: Generated<boolean | null>
  disabled: Generated<boolean | null>
  createdAt: Generated<string>
}

export interface Vaccinations {
  id: Generated<number>
  image: Buffer
  expirationDate: string
  types: Generated<Json | null>
  petId: number | null
  createdAt: Generated<string>
}

export interface Documents {
  id: Generated<number>
  name: string
  content: string
}

export interface DB {
  // accounts: Accounts
  // authenticationMethods: AuthenticationMethods
  // oidcPayloads: OidcPayloads
  accounts: AccountsTable
  authenticationMethods: AuthenticationMethodsTable
  oidcPayloads: OidcPayloadsTable
  announcements: Announcements
  bookingPetKennel: BookingPetKennel
  bookings: Bookings
  bookingService: BookingService
  bookingStatus: BookingStatus
  buildings: Buildings
  categories: Categories
  categoryPrices: CategoryPrices
  contactPeople: ContactPeople
  customers: Customers
  daycareDatePetKennel: DaycareDatePetKennel
  daycareDates: DaycareDates
  daycareSubscriptions: DaycareSubscriptions
  customerDaycareSubscriptions: CustomerDaycareSubscriptions
  emailTemplates: EmailTemplates
  kennels: Kennels
  openingTimes: OpeningTimes
  periods: Periods
  pets: Pets
  services: Services
  vaccinations: Vaccinations
  documents: Documents
}
