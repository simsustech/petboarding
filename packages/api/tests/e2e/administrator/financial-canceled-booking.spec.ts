import { test, expect, request as newRequest } from '@playwright/test'
import type { APIRequestContext, Browser } from '@playwright/test'
import { E2E_PASSWORD } from '../auth-state'
import { initializeAndLogin } from '../setup'

/**
 * A booking canceled inside the cancelation period owes its cancelation tier, so
 * it has to be recorded as `canceledoutsideperiod` — the only cancelation status
 * `admin.getUnpaidBookings` (and therefore `/admin/financial/overview`) lists.
 *
 * The reproduction is a booking for tomorrow, canceled immediately. Its status
 * used to come from `cancelBooking`'s fallback for a missing `api.config.js`
 * instead of from `bookingCancelationHandler`, because the booking reference was
 * passed to that handler as an unawaited promise. The fallback only says
 * `canceledoutsideperiod` for a booking that is *currently approved*, so a
 * booking canceled before (or without) approval was stored as `canceled` while
 * its cancelation tier was billed anyway — the fee existed and was invisible.
 *
 * Both cancel routes are pinned here, because they used to derive the status
 * differently: `user.cancelBooking` (the account UI) and `employee.cancelBooking`
 * (the staff UI).
 *
 * The third test needs a SlimFact-connected stack (the fee is only collectable
 * once it is on an unpaid bill) and skips itself otherwise. Its stay starts
 * *today* on purpose: `admin.getUnpaidBookings` only considers bookings whose
 * `startDate` is not in the future (the "last 90 days" window), so a booking for
 * tomorrow carries its fee without ever being listed there.
 */

const BASE_URL =
  process.env.PETBOARDING_E2E_BASE_URL ?? 'https://petboarding.localhost'

const ADMIN = 'admin@petboarding.app'
const CUSTOMER = 'test1@petboarding.app'
/** Seeded pet of the `test1@petboarding.app` customer. */
const CUSTOMER_PET_ID = 1
/** `admin@petboarding.app` also has a customer profile: customer 6, pet 6. */
const ADMIN_CUSTOMER_ID = 6
const ADMIN_PET_ID = 6

/** The status the cancelation period implies for a stay that starts tomorrow. */
const INSIDE_PERIOD = 'canceledoutsideperiod'

/** Local (not UTC) `yyyy-MM-dd`, so "tomorrow" never lands on today. */
const localDate = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')

const tomorrow = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return localDate(date)
}
const today = () => localDate(new Date())

interface Booking {
  id: number
  status?: { status?: string }
  invoiceUuid?: string | null
}

let api: APIRequestContext

/** tRPC answers a (batched) call as `result.data.json`. */
const unwrap = (entry: any) => entry?.result?.data?.json ?? entry?.result?.data

const call = async <T>({
  token,
  path,
  input,
  mutation
}: {
  token: string
  path: string
  input: unknown
  mutation: boolean
}): Promise<T> => {
  const url = mutation
    ? `${BASE_URL}/trpc/${path}?batch=1`
    : `${BASE_URL}/trpc/${path}?batch=1&input=${encodeURIComponent(
        JSON.stringify({ '0': input })
      )}`
  const res = mutation
    ? await api.post(url, {
        headers: { Authorization: `Bearer ${token}` },
        data: { '0': input }
      })
    : await api.get(url, { headers: { Authorization: `Bearer ${token}` } })
  const body = await res.text()
  expect(
    res.ok(),
    `tRPC ${path} -> ${res.status()}: ${body.slice(0, 500)}`
  ).toBeTruthy()

  return unwrap(JSON.parse(body)[0]) as T
}

/** The bearer token the app itself sends, captured from a `/trpc/` request. */
const tokenFor = async (
  page: Awaited<ReturnType<typeof initializeAndLogin>>
) => {
  const tokenPromise = page.waitForRequest(
    (req) => req.url().includes('/trpc/') && !!req.headers()['authorization'],
    { timeout: 60000 }
  )
  await page.goto(`${BASE_URL}/user`)
  await page.waitForLoadState('networkidle')

  return ((await tokenPromise).headers()['authorization'] as string).replace(
    'Bearer ',
    ''
  )
}

const loginAs = async (browser: Browser, email: string) => {
  const page = await initializeAndLogin({
    browser,
    email,
    password: E2E_PASSWORD
  })
  const token = await tokenFor(page)
  expect(token, `no bearer token for ${email}`).toBeTruthy()

  return { page, token }
}

let tokens: Record<string, string>

const token = (email: string) => {
  const value = tokens[email]
  if (!value) throw new Error(`no token captured for ${email}`)

  return value
}

/** A one-day stay starting on `date`, created through the requested route. */
const createStay = async ({
  date,
  route,
  token: bearer,
  customerId,
  petIds
}: {
  date: string
  route: 'user' | 'employee'
  token: string
  customerId?: number
  petIds: number[]
}) => {
  const created = await call<Booking>({
    token: bearer,
    path: `${route}.createBooking`,
    mutation: true,
    input: {
      startDate: date,
      endDate: date,
      startTimeId: 1,
      endTimeId: 2,
      comments: 'e2e: cancelation inside the period',
      ...(customerId ? { customerId } : {}),
      petIds
    }
  })
  expect(created?.id, 'booking was not created').toBeTruthy()

  return { ...created, date }
}

const cancel = (token: string, id: number) =>
  call({
    token,
    path: 'user.cancelBooking',
    mutation: true,
    input: { id, reason: 'e2e: cancel for tomorrow' }
  })

/** The booking as the app reads it, including the status the UI shows. */
const bookingState = (id: number) =>
  call<Booking>({
    token: token(ADMIN),
    path: 'employee.getBooking',
    mutation: false,
    input: { id }
  })

const expectInsidePeriod = (booking: Booking, date: string) => {
  console.log(
    `[financial-canceled-booking] booking ${booking.id} start ${date} -> status ${booking.status?.status}`
  )
  expect(
    booking.status?.status,
    `booking ${booking.id} (start ${date}) should be ${INSIDE_PERIOD}`
  ).toBe(INSIDE_PERIOD)
}

const slimfactConnected = async () => {
  const health = await (await api.get(`${BASE_URL}/health`)).json()

  return health?.checks?.slimfact?.status === 'healthy'
}

test.beforeAll(async ({ browser }) => {
  api = await newRequest.newContext({ ignoreHTTPSErrors: true })

  tokens = {
    [ADMIN]: (await loginAs(browser, ADMIN)).token,
    [CUSTOMER]: (await loginAs(browser, CUSTOMER)).token
  }
})

test.afterAll(async () => {
  await api.dispose()
})

test('a customer cancellation one day before the start is recorded as canceledoutsideperiod', async () => {
  const booking = await createStay({
    date: tomorrow(),
    route: 'user',
    token: token(CUSTOMER),
    petIds: [CUSTOMER_PET_ID]
  })

  await cancel(token(CUSTOMER), booking.id)

  expectInsidePeriod(await bookingState(booking.id), booking.date)
})

test('a staff cancellation one day before the start is recorded as canceledoutsideperiod', async () => {
  const booking = await createStay({
    date: tomorrow(),
    route: 'employee',
    token: token(ADMIN),
    customerId: ADMIN_CUSTOMER_ID,
    petIds: [ADMIN_PET_ID]
  })

  await call({
    token: token(ADMIN),
    path: 'employee.cancelBooking',
    mutation: true,
    input: { id: booking.id, reason: 'e2e: staff cancel for tomorrow' }
  })

  expectInsidePeriod(await bookingState(booking.id), booking.date)
})

test('the cancelation of a booking that has started is listed as unpaid', async ({
  browser
}) => {
  test.skip(
    !(await slimfactConnected()),
    'Requires a SlimFact-connected stack (the fee is billed on an invoice)'
  )

  const booking = await createStay({
    date: today(),
    route: 'employee',
    token: token(ADMIN),
    customerId: ADMIN_CUSTOMER_ID,
    petIds: [ADMIN_PET_ID]
  })

  // Approving bills the booking; with a down payment due that is
  // `awaitingdownpayment`, which is exactly the status the fallback used to
  // mistake for "not a cancelation inside the period".
  await call({
    token: token(ADMIN),
    path: 'admin.approveBooking',
    mutation: true,
    input: {
      id: booking.id,
      emailSubject: 'e2e: approved',
      emailText: 'e2e: approved'
    }
  })

  // A stay that starts today can only be cancelled by staff, and the booking has
  // to be listed for its unpaid bill — the window keeps `startDate <= today`.
  await call({
    token: token(ADMIN),
    path: 'employee.cancelBooking',
    mutation: true,
    input: { id: booking.id, reason: 'e2e: staff cancel of a started stay' }
  })

  const state = await bookingState(booking.id)
  expectInsidePeriod(state, booking.date)
  expect(
    state.invoiceUuid,
    `booking ${booking.id} was billed as a cancelation but has no invoice`
  ).toBeTruthy()

  const unpaid =
    (await call<Booking[]>({
      token: token(ADMIN),
      path: 'admin.getUnpaidBookings',
      mutation: false,
      input: { days: 90 }
    })) ?? []
  expect(
    unpaid.map((b) => b.id),
    `booking ${booking.id} is missing from admin.getUnpaidBookings`
  ).toContain(booking.id)

  // ...and the page the staff actually looks at renders it.
  const page = await initializeAndLogin({
    browser,
    email: ADMIN,
    password: E2E_PASSWORD
  })
  await page.goto('/admin/financial/overview')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(/financial\/overview/, { timeout: 10000 })
  await page.waitForTimeout(2000)

  await expect(
    page.getByText('No unpaid bookings in the last 90 days.')
  ).not.toBeVisible()
})
