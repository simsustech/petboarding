import { describe, expect, it } from 'vitest'
import routes from './routes.js'
import enUS from '../lang/en-US.js'
import nl from '../lang/nl.js'

/**
 * Nav-sync guard: a route whose `meta.lang` is missing — or whose language key has no
 * `title` — must fall back to the site name, not render blank.
 */

interface RouteNode {
  path: string
  component?: unknown
  children?: RouteNode[]
  meta?: { lang?: string }
}

/** Leaf routes with a full path (children inherit the parent's path segments). */
function leaves(
  nodes: RouteNode[],
  base = ''
): { full: string; lang?: string }[] {
  return nodes.flatMap((node) => {
    const segment = (node.path || '').replace(/^\//, '')
    const full =
      base === '' ? `/${segment}` : segment ? `${base}/${segment}` : base
    const normalized = full.replace(/\/\/+/, '/')
    if (node.children?.length) return leaves(node.children, normalized)
    return [{ full: normalized || '/', lang: node.meta?.lang }]
  })
}

/**
 * Routes that never carry a title by design: the root (site name), the OAuth
 * landing page, the `redirect*` hand-offs and the print layout (its own header).
 */
const isExempt = (full: string) =>
  full === '/' ||
  full === '/user' ||
  full.includes('catchAll') ||
  full.startsWith('/redirect') ||
  full.startsWith('/print')

describe('nav-sync: every route declares a language title', () => {
  it('resolves meta.lang to a non-empty title in en-US and nl', () => {
    const problems: string[] = []

    for (const route of leaves(routes as RouteNode[])) {
      if (isExempt(route.full)) continue

      if (!route.lang) {
        problems.push(`${route.full}: no meta.lang`)
        continue
      }
      const enTitle = (enUS as unknown as Record<string, { title?: string }>)[
        route.lang
      ]?.title
      const nlTitle = (nl as unknown as Record<string, { title?: string }>)[
        route.lang
      ]?.title
      if (!enTitle)
        problems.push(`${route.full}: en-US.${route.lang}.title missing`)
      if (!nlTitle)
        problems.push(`${route.full}: nl.${route.lang}.title missing`)
    }

    expect(problems, `\n${problems.join('\n')}\n`).toEqual([])
  })
})
