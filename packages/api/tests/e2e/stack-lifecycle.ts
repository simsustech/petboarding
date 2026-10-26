import { isAbsolute, resolve } from 'node:path'

/** Opt-out flag for a run that should not manage the docker test stack. */
export const E2E_OWN_STACK_ENV = 'E2E_OWN_STACK'

const E2E_COMPOSE_FILES_ENV = 'E2E_COMPOSE_FILES'

/**
 * Repo root: an explicit override, else four levels up from this file
 * (packages/api/tests/e2e).
 */
function repoRoot(env: NodeJS.ProcessEnv): string {
  return env.PETBOARDING_ROOT || resolve(import.meta.dirname, '../../../..')
}

/**
 * Whether this run owns the docker test stack.
 *
 * Wrapper runs (the slimfact overlay, screenshot runs) bring their own stack and
 * the global setup must not fight them, so either flag skips ownership.
 * Otherwise the stack is owned by default and `E2E_OWN_STACK=0` is the explicit
 * opt-out.
 */
export function shouldOwnStack(env: NodeJS.ProcessEnv): boolean {
  if (env.PLAYWRIGHT_SLIMFACT || env.PLAYWRIGHT_ALLOW_SCREENSHOTS) return false
  return env[E2E_OWN_STACK_ENV] !== '0'
}

/**
 * Compose files for the test stack: the base file first, then any
 * `E2E_COMPOSE_FILES` overlays (colon- or comma-separated), each resolved
 * against the repo root so callers can pass them straight to `docker compose -f`.
 */
export function composeFiles(env: NodeJS.ProcessEnv): string[] {
  const root = repoRoot(env)
  const overlays = (env[E2E_COMPOSE_FILES_ENV] ?? '')
    .split(/[:,]/)
    .map((file) => file.trim())
    .filter(Boolean)
    .map((file) => (isAbsolute(file) ? file : resolve(root, file)))

  return [resolve(root, 'docker-compose.test.yaml'), ...overlays]
}
