import { test, expect } from '@playwright/test'
import { initializePage, login } from '../setup'

/**
 * `/employee/customers` and `/employee/pets` are search-first: the seeded audit
 * captures (`employee-customers.png`, `employee-pets.png`) show a toolbar with a
 * search field and an otherwise empty page, with nothing saying why.
 *
 * The pages now name the search ("Type to search ...") and, while nothing is
 * selected, say what selecting something will show.
 */

const ADMIN = { email: 'admin@petboarding.app', password: 'qjiNWdT8L' }

test.describe('search-first employee pages say what to do', () => {
  test('customers page hints at the search and explains the empty area', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/employee/customers')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Type to search customers...')).toBeVisible()
    await expect(
      page.getByText('Search for a customer to see their details.')
    ).toBeVisible()
  })

  test('pets page hints at the search and explains the empty area', async ({
    browser
  }) => {
    const page = await initializePage({ browser })
    await page.setViewportSize({ width: 1440, height: 900 })
    await login({ page, email: ADMIN.email, password: ADMIN.password })

    await page.goto('/employee/pets')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Type to search pets...')).toBeVisible()
    await expect(
      page.getByText('Search for a pet to see its details.')
    ).toBeVisible()

    // Selecting a pet still loads its detail — the empty state must not swallow it.
    await page.goto('/employee/pets/2')
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByText('Search for a pet to see its details.')
    ).toHaveCount(0)
  })
})
