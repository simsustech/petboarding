import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import type { Locator, Page } from '@playwright/test'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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

const startDate = faker.date
  .soon({ days: 90 }, new Date())
  .toISOString()
  .split('T')[0]
const endDate = faker.date
  .soon({ days: 30 }, startDate)
  .toISOString()
  .split('T')[0]
const booking = {
  startDate,
  endDate,
  startTime: 'Morning',
  endTime: 'Morning'
}

let page: Page

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  async function dragAndDrop(locatorToDrag: Locator) {
    const toDragBox = await locatorToDrag.boundingBox()

    // await locatorToDrag.dragTo(locatorToDrag, {
    //   targetPosition: {
    //     x: toDragBox!.x + toDragBox!.width,
    //     y: toDragBox!.y
    //   }
    // })

    await locatorToDrag.hover()
    await page.mouse.down()
    delay(200)
    await page.mouse.move(
      toDragBox!.x + 300,
      toDragBox!.y + toDragBox!.height / 2
    )
    await page.mouse.up()
    // await page.mouse.move(
    //   toDragBox!.x + toDragBox!.width / 2 + 300,
    //   toDragBox!.y + toDragBox!.height / 2 + 300
    // )
    // await page.mouse.up()
  }

  page = await browser.newPage()

  await page.goto('/')

  await page.click('text=Login')

  await page.waitForLoadState('networkidle')
  await page.click('text=Create account')

  await delay(200)
  await page.locator('text="Email"').fill(email)
  await page.locator('text="Password"').fill(password)
  await page.locator('text="Repeat password"').fill(password)

  const slider = page.locator('.q-slider__thumb')
  // const sliderBox = await page
  //   .locator('.q-slider__track-container')
  //   .boundingBox()
  // await slider.dragTo(slider, {
  //   force: true,
  //   targetPosition: {
  //     x: sliderBox!.x + sliderBox!.width,
  //     y: sliderBox!.y + sliderBox!.height / 2
  //   },
  // })

  await dragAndDrop(slider)

  await page.locator('button >> text=Submit').click()

  const dialog = page.locator(
    'text="Your account has been sucessfully created. You can now login with your credentials."'
  )
  const okButton = dialog.locator('../div/button')
  await okButton.click()

  await expect(page).toHaveURL(/.*login/)

  // await page.goto('/')

  // await page.click('text=Login')

  await page.locator('text="Email"').fill(email)
  await page.locator('text="Password"').fill(password)

  await page.locator('button >> text=Login').click()

  await page.waitForURL(/.*user/)
  await expect(
    page.getByText('Account').locator(':scope.q-item__label')
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

    await page.locator('button >> text=Add').click()

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

    await page.locator('button >> text=edit').click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await page.getByLabel('First name*').fill('NewFirstName')
    await dialog.locator('text=Submit').click()

    await expect(page.locator(`text=NewFirstName`)).toBeVisible()
  })

  test('Add contact person', async () => {
    await page.goto('/account/contactpeople')

    await page.locator('button >> text=Add').click()
    await page.getByLabel('First name').fill(contactPerson.firstName)
    await page.getByLabel('Last name').fill(contactPerson.lastName)
    await page
      .getByLabel('Telephone number')
      .fill(contactPerson.telephoneNumber)

    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${contactPerson.firstName}`)).toBeVisible()

    await page.locator('button >> text=edit').click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await page.getByLabel('First name*').fill('NewContactPersonFirstName')
    await dialog.locator('text=Submit').click()

    await expect(page.locator(`text=NewContactPersonFirstName`)).toBeVisible()
  })

  test('Add pet', async () => {
    await page.goto('/account/pets')

    await page.locator('button >> text=Add').click()
    await page.getByLabel('Name').fill(pet.name)
    await page.getByLabel('Breed').fill(pet.breed)
    // await page.getByLabel('Birth date').fill(pet.birthDate)
    const [YYYY, MM, DD] = pet.birthDate.split('-')
    await page.getByPlaceholder('DD').first().fill(DD)
    await page.getByPlaceholder('MM').first().fill(MM)
    await page.getByPlaceholder('YYYY').first().fill(YYYY)

    await page.locator('#gender').click()
    await page.getByRole('option', { name: 'Female' }).click()
    await page.getByLabel('Sterilized').first().click()
    await page.getByRole('option', { name: 'Yes' }).click()
    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${pet.name}`)).toBeVisible()

    await page.locator('button >> text=edit').click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await page.getByLabel('Name*').fill(newPetName)
    await dialog.locator('text=Submit').click()

    await expect(page.locator(`text=${newPetName}`)).toBeVisible()
  })

  test('Add booking', async () => {
    await page.goto('/account/bookings')

    await page.locator('button >> text=Add').click()

    await page.locator('.q-date__calendar-item--in').first().click()
    await page
      .locator('.q-date__navigation > div:nth-child(3) > .q-btn')
      .click()
    // await page.locator('div:nth-child(3) > .q-btn').first().click()
    await page.locator('.q-date__calendar-item--in').first().click()

    await page.getByLabel('Pets').click()
    await page.getByRole('option', { name: newPetName }).click()

    await page.getByLabel('Start time').click()
    await page.getByRole('option', { name: booking.startTime }).click()
    await page.getByLabel('End time').click()
    await page.getByRole('option', { name: booking.endTime }).click()

    await page
      .getByRole('checkbox', { name: 'I agree to the terms and conditions.' })
      .click()

    await page.locator('text=Submit').click()

    await expect(page.getByText('hourglass_empty')).toBeVisible()

    await page.locator('button >> text=edit').click()
    await page.getByText('Edit', { exact: true }).click()
    await page.getByLabel('Start time').click()
    await page.getByRole('option', { name: 'Evening' }).click()
    await page
      .getByRole('checkbox', { name: 'I agree to the terms and conditions.' })
      .click()

    await page.locator('text=Submit').click()

    await expect(page.getByText('Evening').first()).toBeVisible()
  })
})
