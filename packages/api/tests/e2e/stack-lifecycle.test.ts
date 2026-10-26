import { basename } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  E2E_OWN_STACK_ENV,
  composeFiles,
  shouldOwnStack
} from './stack-lifecycle'

describe('shouldOwnStack', () => {
  const cases: Array<[string, NodeJS.ProcessEnv, boolean]> = [
    ['owns the stack by default', {}, true],
    [
      'owns the stack on an explicit opt-in',
      { [E2E_OWN_STACK_ENV]: '1' },
      true
    ],
    ['skips on an explicit opt-out', { [E2E_OWN_STACK_ENV]: '0' }, false],
    [
      'skips when the slimfact overlay owns the stack',
      { PLAYWRIGHT_SLIMFACT: 'true' },
      false
    ]
  ]

  it.each(cases)('%s', (_name, env, expected) => {
    expect(shouldOwnStack(env)).toBe(expected)
  })

  it('skips when screenshots mode brings its own stack', () => {
    expect(shouldOwnStack({ PLAYWRIGHT_ALLOW_SCREENSHOTS: 'true' })).toBe(false)
  })
})

describe('composeFiles', () => {
  it('defaults to the test stack compose file', () => {
    expect(composeFiles({}).map((file) => basename(file))).toEqual([
      'docker-compose.test.yaml'
    ])
  })

  it('appends comma-separated overlays after the base file', () => {
    const files = composeFiles({
      E2E_COMPOSE_FILES:
        'docker-compose.test.slimfact.yaml,docker-compose.test.demo.yaml'
    })
    expect(files.map((file) => basename(file))).toEqual([
      'docker-compose.test.yaml',
      'docker-compose.test.slimfact.yaml',
      'docker-compose.test.demo.yaml'
    ])
  })

  it('accepts colon-separated overlays and ignores blank entries', () => {
    const files = composeFiles({
      E2E_COMPOSE_FILES:
        'docker-compose.test.slimfact.yaml: :docker-compose.test.demo.yaml'
    })
    expect(files.map((file) => basename(file))).toEqual([
      'docker-compose.test.yaml',
      'docker-compose.test.slimfact.yaml',
      'docker-compose.test.demo.yaml'
    ])
  })

  it('resolves every file against the repo root', () => {
    const files = composeFiles({
      E2E_COMPOSE_FILES: 'docker-compose.test.demo.yaml'
    })
    for (const file of files) {
      expect(file.startsWith('/')).toBe(true)
    }
  })
})
