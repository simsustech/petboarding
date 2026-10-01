/**
 * Shared free-text search helpers for the customer and pet repositories.
 *
 * The database indexes a *language-neutral* tsvector (config `unaccented` = the
 * `simple` parser + the `unaccent` dictionary — no stemmer and no stopwords; see
 * migrations 07/10). Accent folding therefore happens in the database, but two
 * responsibilities deliberately stay on the query side:
 *
 *   - stopwords: articles/particles (`de`, `het`, `van`, `the`, `le`, …) must
 *     never act as match criteria, so a query made only of them returns nothing
 *     instead of every row that happens to contain one.
 *   - AND between terms: `van Huppeldepup` must narrow to the one person, not
 *     widen (via OR) to everyone whose name contains `van`.
 *
 * The caller's original spelling is passed through untouched — `unaccent` folds
 * it on the database side.
 */
export const SEARCH_CONFIG = 'unaccented'

// Function words that must never be searched on, across the app's Latin-script
// data (Dutch first, then the common German/French/Spanish/English particles).
// This is tunable policy, not fixed truth — extend as the customer base grows.
const SEARCH_STOPWORDS = new Set<string>([
  // nl
  'de',
  'het',
  'een',
  'van',
  'der',
  'den',
  'te',
  'op',
  'in',
  'en',
  'bij',
  'met',
  'voor',
  'aan',
  'ook',
  'tot',
  'uit',
  'over',
  'om',
  'als',
  'dan',
  'dat',
  'die',
  'dit',
  // en
  'a',
  'an',
  'the',
  'of',
  'and',
  'to',
  'on',
  'at',
  'by',
  'for',
  'with',
  // de
  'das',
  'dem',
  'des',
  'ein',
  'eine',
  'einer',
  'eines',
  'und',
  'von',
  'zu',
  'im',
  'am',
  'auf',
  'fur',
  'bei',
  'aus',
  // fr
  'le',
  'la',
  'les',
  'un',
  'une',
  'du',
  'et',
  'dans',
  'sur',
  'pour',
  'par',
  'avec',
  'au',
  'aux',
  'ce',
  'cette',
  // es
  'el',
  'los',
  'las',
  'y',
  'del',
  'con',
  'por',
  'para',
  'al'
])

/** Accent-insensitive, case-insensitive comparison key for stopword matching. */
const stopwordKey = (term: string): string =>
  term
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

/**
 * Turn a raw search phrase into a safe tsquery string for the `unaccented`
 * config: unicode letters/numbers are preserved (the database folds accents),
 * stopwords are dropped, the remaining terms are AND-joined, and every term is
 * prefix-matched (`:*`). Returns '' when nothing searchable remains, which
 * callers treat as "no rows".
 *
 * Only `\p{L}\p{N}` characters survive, so no tsquery operator the caller typed
 * (`&`, `|`, `!`, parentheses) can leak into the query text.
 */
export function buildSearchTsQuery(searchPhrase: string): string {
  if (!searchPhrase || typeof searchPhrase !== 'string') return ''

  const terms = searchPhrase
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .split(/\s+/)
    .map((term) => term.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(
      (term) => term.length > 0 && !SEARCH_STOPWORDS.has(stopwordKey(term))
    )

  if (terms.length === 0) return ''

  return terms.map((term) => `${term}:*`).join(' & ')
}

/**
 * The indexed tsvector expression for a customer row.
 *
 * MUST stay structurally identical to the expression in migration 07
 * (`customers_search_idx`) or Postgres will not use the index. `alias` is the
 * query's table alias (`'c.'`); the empty string is the unqualified form used in
 * the index definition.
 */
export function customerSearchVector(alias = ''): string {
  return (
    `to_tsvector('${SEARCH_CONFIG}', ` +
    `coalesce(${alias}first_name, '') || ' ' || ` +
    `coalesce(${alias}last_name, '') || ' ' || ` +
    `coalesce(${alias}city, '') || ' ' || ` +
    `coalesce(${alias}address, ''))`
  )
}

/**
 * The indexed tsvector expression for a pet row. Must stay in sync with
 * migration 10 (`pets_search_idx`). See {@link customerSearchVector}.
 */
export function petSearchVector(alias = ''): string {
  return (
    `to_tsvector('${SEARCH_CONFIG}', ` +
    `coalesce(${alias}name, '') || ' ' || ` +
    `coalesce(${alias}breed, '') || ' ' || ` +
    `coalesce(${alias}chip_number, '') || ' ' || ` +
    `coalesce(${alias}color, ''))`
  )
}
