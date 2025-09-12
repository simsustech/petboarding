import { type Browser, expect, Locator, Page } from '@playwright/test'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function dragAndDrop({
  page,
  locatorToDrag
}: {
  page: Page
  locatorToDrag: Locator
}) {
  const toDragBox = await locatorToDrag.boundingBox()

  await locatorToDrag.hover()
  await page.mouse.down()
  delay(200)
  await page.mouse.move(
    toDragBox!.x + 300,
    toDragBox!.y + toDragBox!.height / 2
  )
  await page.mouse.up()
}

export const initializeAndLogin = async ({
  browser,
  email,
  password
}: {
  browser: Browser
  email: string
  password: string
}) => {
  const page = await initializePage({ browser })
  await login({ page, email, password })

  return page
}

export const initializePage = async ({ browser }: { browser: Browser }) => {
  const page = await browser.newPage()

  page.on('pageerror', (exception) => {
    console.log(`Uncaught exception: "${exception}"`)
  })

  return page
}

export const login = async ({
  page,
  email,
  password
}: {
  page: Page
  email: string
  password: string
}) => {
  await page.goto('/')

  await page.click('text=Login')

  await page.waitForLoadState('networkidle')

  await expect(page).toHaveURL(/.*login/)

  await page.locator('text="Email"').fill(email)
  await page.locator('text="Password"').fill(password)

  await page.locator('button >> text=Login').click()

  await page.waitForURL(/.*user/)

  return
}

export const registerAndLogin = async ({
  page,
  email,
  password
}: {
  page: Page
  email: string
  password: string
}) => {
  await page.goto('/')

  await page.click('text=Login')

  await page.waitForLoadState('networkidle')
  await page.click('text=Create account')

  await delay(200)
  await page.locator('text="Email"').fill(email)
  await page.locator('text="Password"').fill(password)
  await page.locator('text="Repeat password"').fill(password)

  const slider = page.locator('.q-slider__thumb')

  await dragAndDrop({ page, locatorToDrag: slider })

  await page.locator('button >> text=Submit').click()

  const dialog = page.locator(
    'text="Your account has been sucessfully created. You can now login with your credentials."'
  )
  const okButton = dialog.locator('../div/button')
  await okButton.click()

  await expect(page).toHaveURL(/.*login/)

  await page.locator('text="Email"').fill(email)
  await page.locator('text="Password"').fill(password)

  await page.locator('button >> text=Login').click()

  await page.waitForURL(/.*user/)

  return
}
