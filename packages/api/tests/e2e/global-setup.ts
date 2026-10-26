import { execSync } from 'node:child_process'
import { chromium } from '@playwright/test'

import { composeFiles, shouldOwnStack } from './stack-lifecycle'
import { E2E_ROLES, saveAuthState } from './auth-state'

// This file owns the test stack's lifecycle, so a run never pays for it twice:
// the CI workflow only prepares the external `web` network before handing over
// (see .github/workflows/test staging.yaml). The image build is the cold cost
// on a fresh runner, so its budget is deliberately generous.
const BUILD_TIMEOUT_MS = Number(process.env.E2E_BUILD_TIMEOUT_MS ?? 900000)

/**
 * Log the seeded roles in once and save their storageState, so every test does
 * not repeat the OIDC round-trip. A failure here is not fatal: a test falls
 * back to a real login when its state file is missing.
 */
const captureAuthStates = async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] })
  try {
    for (const email of E2E_ROLES) {
      console.log(`[global-setup] Capturing auth state for ${email}…`)
      await saveAuthState(browser, email)
    }
  } finally {
    await browser.close()
  }
}

export default async function globalSetup() {
  if (shouldOwnStack(process.env)) {
    const files = composeFiles(process.env)
      .map((file) => `-f ${file}`)
      .join(' ')

    execSync(`docker compose ${files} down --volumes --remove-orphans`, {
      stdio: 'inherit',
      timeout: 30000
    })
    console.log('[global-setup] Building test stack images…')
    execSync(`docker compose ${files} build app`, {
      stdio: 'inherit',
      timeout: BUILD_TIMEOUT_MS,
      env: {
        ...process.env
      }
    })
    console.log('[global-setup] Starting test stack…')
    // --no-build: the image was just built above, so a missing image should fail
    // here instead of rebuilding inside this step's shorter timeout.
    execSync(`docker compose ${files} up -d --wait --no-build`, {
      stdio: 'inherit',
      timeout: 300000
    })
    console.log('[global-setup] Stack ready.')
  } else {
    console.log('[global-setup] external stack, skipping')
  }

  try {
    await captureAuthStates()
  } catch (error) {
    console.log('[global-setup] auth-state capture skipped:', error)
  }
}
