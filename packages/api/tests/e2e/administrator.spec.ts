import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

// import { format } from 'date-fns'
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const email = 'admin@petboarding.app'
const password = 'qjiNWdT8L'

let page: Page

const time = new Date().getTime()
const announcement = {
  title: `Title ${time}`,
  message: `Message ${time}`
}
const period = {
  startDate: '2024-02-02',
  endDate: '2024-02-22',
  comments: `Comments ${time}`
}
const category = {
  name: `Category ${time}`,
  price: 111
}
const service = {
  name: `Service ${time}`,
  description: `Description ${time}`
}
const openingTime = {
  name: `Opening time ${time}`,
  startTime: '20:00',
  endTime: '21:00'
}
test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()

  await page.goto('/')

  await page.click('text=Login')

  await page.waitForLoadState('networkidle')

  await expect(page).toHaveURL(/.*login/)

  await page.locator('text="Email"').fill(email)
  await page.locator('text="Password"').fill(password)

  await page.locator('button >> text=Submit').click()

  await expect(page).toHaveURL(/.*redirect/)
  await page.waitForURL(/.*user/)
  await expect(
    page.getByText('Administrator').locator(':scope.q-item__label')
  ).toBeVisible()
})

test.describe('Accounts', async () => {
  test('Search account', async () => {
    await page.goto('/admin/accounts')
    await page.waitForLoadState('networkidle')

    await page.getByLabel('Email').fill('admin')

    await expect(page.locator(`text=admin@petboarding.app`)).toBeVisible()
  })
})

test.describe('Bookings', async () => {
  test('Check bookings', async () => {
    await page.goto('admin/bookings')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('name1 lastName1')).toBeVisible()
  })
})
test.describe('Occupancy', async () => {
  test('Check booking occupancy', async () => {
    await page.goto('admin/occupancy/2024-01-01')
    await page.waitForLoadState('networkidle')

    await page.getByText('2024/01/01').isVisible()
    await expect(
      page
        .locator('div:nth-child(2) > .q-calendar-month__day--content > .column')
        .first()
    ).toHaveText('1 + 0')
  })

  test('Check daycare occupancy', async () => {
    await page.goto('admin/occupancy/2024-02-01')
    await page.waitForLoadState('networkidle')

    await page.getByText('2024/02/01').isVisible()
    await expect(
      page
        .locator('div:nth-child(5) > .q-calendar-month__day--content > .column')
        .first()
    ).toHaveText('0 + 1')
  })
})

test.describe('Announcements', async () => {
  test('Create announcement', async () => {
    await page.goto('/admin/announcements')
    await page.waitForLoadState('networkidle')

    await page.locator('button >> text=Add').click()
    await page.getByLabel('Title').fill(announcement.title)
    await page.getByLabel('Message').fill(announcement.message)
    await page.getByLabel('Expiration date').fill('2040/01/01')

    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${announcement.message}`)).toBeVisible()
  })
  test('Update announcement', async () => {
    await page.locator('button').filter({ hasText: 'edit' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await page.getByLabel('Title').fill('UpdatedTitle')
    await dialog.locator('text=Submit').click()
    await expect(page.getByText('UpdatedTitle').first()).toBeVisible()
  })

  test('Delete announcement', async () => {
    await page.locator('button').filter({ hasText: 'delete' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await dialog.locator('text=Ok').click()

    await expect(page.getByText('UpdatedTitle')).toHaveCount(0)
  })
})

test.describe('Periods', async () => {
  test('Create period', async () => {
    await page.goto('/admin/periods')
    await page.waitForLoadState('networkidle')

    await page.locator('button >> text=Add').click()
    await page.getByLabel('Start date').fill(period.startDate)
    await page.getByLabel('End date').fill(`${period.endDate}`)
    await page.getByLabel('Comments').fill(`${period.comments}`)

    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${period.comments}`)).toBeVisible()
  })
  test('Update period', async () => {
    await page.locator('button').filter({ hasText: 'edit' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await page.getByLabel('Comments').fill('UpdatedComments')
    await dialog.locator('text=Submit').click()
    await expect(page.getByText('UpdatedComments').first()).toBeVisible()
  })

  test('Delete period', async () => {
    await page.locator('button').filter({ hasText: 'delete' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await dialog.locator('text=Ok').click()

    await expect(page.getByText('UpdatedComments')).toHaveCount(0)
  })
})

test.describe('Categories', async () => {
  test('Create category', async () => {
    await page.goto('/admin/configuration/categories')
    await page.waitForLoadState('networkidle')

    await page.locator('button >> text=Add').click()
    await page.getByLabel('Name').fill(category.name)
    await page.getByLabel('Price').fill(`${category.price}`)

    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${category.name}`)).toBeVisible()
  })
  test('Update category', async () => {
    await page.locator('button').filter({ hasText: 'edit' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await page.getByLabel('Name').fill('UpdatedName')
    await dialog.locator('text=Submit').click()
    await expect(page.getByText('UpdatedName').first()).toBeVisible()
  })

  test('Delete category', async () => {
    await page.locator('button').filter({ hasText: 'delete' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await dialog.locator('text=Ok').click()

    await expect(page.getByText('UpdatedName')).toHaveCount(0)
  })
})

test.describe('Services', async () => {
  test('Create service', async () => {
    await page.goto('/admin/configuration/services')
    await page.waitForLoadState('networkidle')

    await page.locator('button >> text=Add').click()
    await page.getByLabel('Name').fill(service.name)
    await page.getByLabel('Description').fill(`${service.description}`)

    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${service.name}`)).toBeVisible()
  })
  test('Update service', async () => {
    await page.locator('button').filter({ hasText: 'edit' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await page.getByLabel('Name').fill('UpdatedName')
    await dialog.locator('text=Submit').click()
    await expect(page.getByText('UpdatedName').first()).toBeVisible()
  })

  test('Delete service', async () => {
    await page.locator('button').filter({ hasText: 'delete' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await dialog.locator('text=Ok').click()

    await expect(page.getByText('UpdatedName')).toHaveCount(0)
  })
})

test.describe('Opening times', async () => {
  test('Create opening time', async () => {
    await page.goto('/admin/configuration/openingtimes')
    await page.waitForLoadState('networkidle')

    await page.locator('button >> text=Add').click()
    await page.getByLabel('Name').fill(openingTime.name)
    await page.getByLabel('Start time').fill(openingTime.startTime)
    await page.getByLabel('End time').fill(openingTime.endTime)

    await page.locator('text=Submit').click()

    await expect(page.locator(`text=${openingTime.name}`)).toBeVisible()
  })
  test('Update opening time', async () => {
    await page.locator('button').filter({ hasText: 'edit' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await page.getByLabel('Name').fill('UpdatedName')
    await dialog.locator('text=Submit').click()
    await expect(page.getByText('UpdatedName').first()).toBeVisible()
  })

  test('Delete opening time', async () => {
    await page.locator('button').filter({ hasText: 'delete' }).last().click()
    const dialog = page.locator('.q-dialog')
    await dialog.isVisible()
    await dialog.locator('text=Ok').click()

    await expect(page.getByText('UpdatedName')).toHaveCount(0)
  })
})
