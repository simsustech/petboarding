import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import type { Locator, Page } from '@playwright/test'
import { initializePage, registerAndLogin } from './setup'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Pick a q-select time option and prove it committed. Quasar keeps a just-closed menu
 * in the DOM while it animates, so a next-field click can land on a stale `option`
 * from the previous menu, silently leaving the field empty and blocking Submit.
 */
const selectTime = async (page: Page, label: string, value: string) => {
  const field = page.getByLabel(label)
  const wrapper = page.locator('.q-field').filter({ hasText: label }).first()

  for (let attempt = 0; attempt < 4; attempt++) {
    await field.click()
    await delay(400)

    const option = page
      .locator('.q-menu:visible')
      .getByRole('option', { name: value })
      .first()

    if (await option.count()) {
      await option.click({ timeout: 3000 }).catch(() => undefined)
    }

    await delay(300)
    if ((await wrapper.innerText()).includes(value)) {
      return
    }
  }

  throw new Error(`${label} did not commit "${value}" after 4 attempts`)
}

const email = faker.internet.email()
const password = faker.internet.password()

const customer = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  // postalCode: faker.address.zipCode('####??'),
  postalCode: '1234AB',
  veterinarian: faker.person.fullName(),
  telephoneNumber: faker.phone.number()
}

const contactPerson = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  telephoneNumber: faker.phone.number()
}

const pet = {
  name: faker.person.firstName(),
  breed: faker.animal.dog(),
  birthDate: faker.date.past({ years: 10 }).toISOString().split('T')[0]
  // .replace('-', '/')
}
const newPetName = faker.person.firstName()

/**
 * 2040 + a run-varying day, snapped to a weekday: `faker.soon` drew dates inside the
 * window previous runs occupy, so runs overlapped themselves and blocked the
 * confirmation. 2040 collides with no seeded data, and the weekday satisfies Evening.
 */
const bookingStart = (() => {
  const d = new Date(
    Date.UTC(2040, 0, 1 + (Math.floor(Date.now() / 60000) % 300))
  )
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) {
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return d
})()
const startDate = bookingStart.toISOString().slice(0, 10)
const endDate = new Date(bookingStart.getTime() + 4 * 864e5)
  .toISOString()
  .slice(0, 10)
const booking = {
  startDate,
  endDate,
  startTime: 'Morning',
  // End must be after start: Morning->Morning made the form reject the End
  // selection ("Field is required"), so the OK confirmation never appeared.
  // Opening times: Morning 09-10, Evening 17-18 (seed).
  endTime: 'Evening'
}

let page: Page

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await initializePage({ browser })
  await registerAndLogin({ page, email, password })

  await expect(
    page
      .getByRole('tab', { name: 'Account' })
      .or(page.getByText('Account').locator(':scope.q-item__label'))
  ).toBeVisible()
})

test.describe('Account', async () => {
  // test('Login', async ({}) => {
  //   await page.goto('/')

  //   await page.click('text=Login')

  //   await page.locator('text="Email"').fill(email)
  //   await page.locator('text="Password"').fill(password)

  //   await page.locator('button >> text=Submit').click()

  //   await expect(page).toHaveURL(/.*redirect/)
  // })

  test('Add customer details', async () => {
    await page.goto('/account/customer')

    await page.locator('#fabAdd').click()

    await page.getByLabel('Gender').click()
    await page.getByRole('option', { name: 'Male', exact: true }).click()
    await page.getByLabel('First name').fill(customer.firstName)
    await page.getByLabel('Last name').fill(customer.lastName)
    await page.getByLabel('Address').fill(customer.address)
    await page.getByLabel('City').fill(customer.city)
    await page.getByLabel('Postal code').fill(customer.postalCode)
    await page.getByLabel('Telephone number').fill(customer.telephoneNumber)
    await page.getByLabel('Veterinarian').fill(customer.veterinarian)

    await page.locator('text=Submit').click()

    expect(page.locator(`text=${customer.firstName}`)).toBeVisible()

    await page.locator('#fabEdit').click()
    const dialog = page.locator('.q-dialog').last()
    await dialog.isVisible()
    await dialog.getByLabel('First name*').fill('NewFirstName')
    await dialog.locator('text=Submit').click()

    await expect(page.locator(`text=NewFirstName`)).toBeVisible()
  })

  test('Add contact person', async () => {
    await page.goto('/account/contactpeople')

    await page.locator('#fabAdd').click()
    await page.getByLabel('First name').fill(contactPerson.firstName)
    await page.getByLabel('Last name').fill(contactPerson.lastName)
    await page
      .getByLabel('Telephone number')
      .fill(contactPerson.telephoneNumber)

    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${contactPerson.firstName}`)).toBeVisible()

    await page.getByTestId('edit-button').click()
    const dialog = page.locator('.q-dialog').last()
    await dialog.isVisible()
    await dialog.getByLabel('First name*').fill('NewContactPersonFirstName')
    await dialog.locator('text=Submit').click()

    await expect(page.locator(`text=NewContactPersonFirstName`)).toBeVisible()
  })

  test('Add pet', async () => {
    await page.goto('/account/pets')

    await page.locator('#fabAdd').click()
    await page.getByLabel('Name').fill(pet.name)
    await page.getByLabel('Breed').fill(pet.breed)
    await page.keyboard.press('Escape') // Close breed autocomplete dropdown
    // await page.getByLabel('Birth date').fill(pet.birthDate)
    const [YYYY, MM, DD] = pet.birthDate.split('-')
    await page.getByPlaceholder('DD').first().fill(DD)
    await page.getByPlaceholder('MM').first().fill(MM)
    await page.getByPlaceholder('YYYY').first().fill(YYYY)

    // Click the control: clicking the wrapper div never opened the popup in the
    // serial sequence (probe: getByLabel('Gender*') opens it and the option clicks).
    await page.getByLabel('Gender*').click()
    await page.getByRole('option', { name: 'Female' }).click()
    await page.getByLabel('Sterilized*').click()
    await page.getByRole('option', { name: 'Yes' }).click()
    await page.keyboard.press('Escape') // Close sterilized dropdown
    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${pet.name}`)).toBeVisible()

    await page.getByTestId('edit-button').click()
    const dialog = page.locator('.q-dialog').last()
    await dialog.isVisible()
    await dialog.getByLabel('Name*').fill(newPetName)
    await dialog.locator('text=Submit').click()

    await expect(page.locator(`text=${newPetName}`)).toBeVisible()
  })

  test('Add booking', async () => {
    await page.goto('/account/bookings')
    await page.waitForLoadState('networkidle')

    await page.locator('#fabAdd').waitFor()
    await page.locator('#fabAdd').click()

    // Pick a range as: click a day, advance a month, click the end. Gate on the day cell
    // (not the month label, which re-renders first) so the second click lands in the new
    // month — otherwise from===to, the range resets, and the time selects stay disabled.
    const dayCell = page.locator('.q-date__calendar-item--in').first()
    const dayCellLabel = dayCell.locator('button')
    await dayCell.click()
    const startCellLabel = await dayCellLabel.getAttribute('aria-label')
    await page
      .locator('.q-date__navigation > div:nth-child(3) > .q-btn')
      .click()
    // await page.locator('div:nth-child(3) > .q-btn').first().click()
    // Gate on the cell we are about to click: it must belong to the new month.
    await expect(dayCellLabel).not.toHaveAttribute(
      'aria-label',
      startCellLabel!
    )

    await dayCell.click()

    // Click the control: the wrapper click did not reliably open the popup.
    await page.getByLabel('Pets', { exact: true }).click()
    // Book the account's own pet (first option): `name1` belongs to another customer,
    // and this pet has no vaccination history.
    await page.getByRole('option').first().click()

    // Close the pets dropdown before the time fields: a lingering popup swallows the next click.
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // Click the controls: wrapper-div clicks left End time empty and blocked Submit.
    await selectTime(page, 'Start time*', booking.startTime)
    await selectTime(page, 'End time*', booking.endTime)

    await page
      .getByRole('checkbox', { name: 'I agree to the terms and conditions.' })
      .click()

    await page.locator('text=Submit').click()

    await page.getByRole('button', { name: 'OK' }).click()
    await expect(page.getByTestId('booking-item-icon-pending')).toBeVisible()

    // await page.locator('button >> text=edit').click()
    // await page.getByText('Edit', { exact: true }).click()
    // await page
    //   .getByRole('main')
    //   .getByLabel('Expand')
    //   .getByRole('button')
    //   .click()

    await page.getByRole('button', { name: 'Expand' }).first().click()
    await page.getByTestId('booking-dates-edit-button').first().click()

    await page.getByText('Edit', { exact: true }).click()
    await page.getByText('Start time*Morning').first().click()
    await page.getByRole('option', { name: 'Evening' }).click()
    await page
      .getByRole('checkbox', { name: 'I agree to the terms and conditions.' })
      .click()

    await page.locator('text=Submit').click()

    await expect(page.getByText('Evening').first()).toBeVisible()
  })
})
