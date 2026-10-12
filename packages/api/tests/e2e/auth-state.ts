import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, type Browser, type Page } from '@playwright/test'

/**
 * Reusable logins: every test currently pays the full OIDC round-trip in
 * `login()`, which was measurable at ~1s per test (122 tests ≈ 2 minutes).
 * `global-setup` logs the seeded roles in once and writes their `storageState`
 * here; `login()` applies the saved state instead of signing in again.
 *
 * The state holds the `_session` / `_interaction` cookies *and* the lionel
 * client's localStorage tokens, so both have to be replayed.
 */

const AUTH_DIR = join(import.meta.dirname, '.auth')

// `global-setup` has no test `use.baseURL`, so the state helper navigates by
// absolute URL.
const BASE_URL =
  process.env.PETBOARDING_E2E_BASE_URL ?? 'https://petboarding.localhost'

/** The seeded password, shared by every role the suite signs in as. */
export const E2E_PASSWORD = 'qjiNWdT8L'

/** The roles `global-setup` pre-authenticates. */
export const E2E_ROLES = [
  'admin@petboarding.app',
  'admin-profileless@petboarding.app',
  'test1@petboarding.app'
]

interface AuthCookie {
  name: string
  value: string
  domain: string
  path: string
  expires: number
  httpOnly: boolean
  secure: boolean
  sameSite: 'Strict' | 'Lax' | 'None'
}

export interface AuthState {
  cookies: AuthCookie[]
  origins: {
    origin: string
    localStorage: { name: string; value: string }[]
  }[]
}

const slug = (email: string) => email.replace(/[^a-zA-Z0-9]+/g, '-')

const statePath = (email: string) => join(AUTH_DIR, `${slug(email)}.json`)

/** The saved state for `email`, or `null` when it has not been captured. */
export function readAuthState(email: string): AuthState | null {
  const path = statePath(email)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as AuthState
  } catch {
    return null
  }
}

/** Sign `email` in through the UI and persist its state for later runs. */
export async function saveAuthState(browser: Browser, email: string) {
  const context = await browser.newContext({
    serviceWorkers: 'block',
    ignoreHTTPSErrors: true
  })
  const page = await context.newPage()

  await page.goto(BASE_URL)
  await page.locator('text=Login').first().click()
  const emailField = page.locator('text="Email"').first()
  await emailField.waitFor({ state: 'visible', timeout: 15000 })
  await expect(page).toHaveURL(/.*login/)
  await emailField.fill(email)
  await page.locator('text="Password"').first().fill(E2E_PASSWORD)
  await page.locator('button >> text=Login').first().click()
  await page.waitForURL(/.*user/)

  mkdirSync(AUTH_DIR, { recursive: true })
  await context.storageState({ path: statePath(email) })
  await context.close()
}

/** Replay a saved state onto an existing context, then land on the app. */
export async function applyAuthState(page: Page, state: AuthState) {
  await page.context().addCookies(state.cookies)
  await page.addInitScript((s: AuthState) => {
    // Run once per tab: a test that signs out must stay signed out.
    if (sessionStorage.getItem('__e2eAuthApplied') === '1') return
    sessionStorage.setItem('__e2eAuthApplied', '1')
    for (const origin of s.origins ?? []) {
      for (const item of origin.localStorage ?? []) {
        try {
          localStorage.setItem(item.name, item.value)
        } catch {
          // ignore storage failures (e.g. private mode)
        }
      }
    }
  }, state)
  // Land where the full flow ends (`login()` waits for `/user`): the home page
  // renders the drawer *and* the tablist, so tests that disambiguate those two
  // (`.or()` + strict mode) would see two matches there.
  await page.goto(`${BASE_URL}/user`)
  // The full flow reached `/user` through the SPA, so its shell was already
  // mounted; a direct goto can resolve first, and probes that read the layout
  // immediately (e.g. `headerControlHits`) would see it half-built.
  await page
    .locator('.q-drawer')
    .first()
    .waitFor({ state: 'attached', timeout: 15000 })
    .catch(() => undefined)
}
