/**
 * Shared free-text search helpers for the customer and pet repositories.
 *
 * The database folds accents (the `unaccented` tsvector config, see migrations
 * 07/10); stopword removal and AND-joining stay on the query side.
 */
export const SEARCH_CONFIG = 'unaccented'

// Function words that must never be match criteria. Tunable: extend as needed.
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
 * Build a safe tsquery: drop stopwords, AND-join and prefix-match (`:*`) the
 * rest, keeping only `\p{L}\p{N}` so no caller-typed operator can leak in.
 * Returns '' when nothing is searchable.
 */
export function buildSearchTsQuery(searchPhrase: string): string {
  if (!searchPhrase || typeof searchPhrase !== 'string') return ''

  // Split on every non-alphanumeric: the vector tokenises `O'Brien` as o+brien
  // and `Peters-de Wit` as peters/de/wit, so a glued `obrien:*` matches neither.
  const terms = searchPhrase
    .split(/[^\p{L}\p{N}]+/u)
    .filter(
      (term) => term.length > 0 && !SEARCH_STOPWORDS.has(stopwordKey(term))
    )

  if (terms.length === 0) return ''

  return terms.map((term) => `${term}:*`).join(' & ')
}

/**
 * Indexed tsvector expression for a customer row. MUST stay identical to the
 * one in migration 07 (`customers_search_idx`) or Postgres will not use it.
 */
export function customerSearchVector(alias = ''): string {
  return `to_tsvector('${SEARCH_CONFIG}', ${customerSearchText(alias)})`
}

/** The customer text a vector is built from (migration 07 concatenates these). */
export function customerSearchText(alias = ''): string {
  return (
    `coalesce(${alias}first_name, '') || ' ' || ` +
    `coalesce(${alias}last_name, '') || ' ' || ` +
    `coalesce(${alias}city, '') || ' ' || ` +
    `coalesce(${alias}address, '')`
  )
}

/** Indexed tsvector expression for a pet row (migration 10, `pets_search_idx`). */
export function petSearchVector(alias = ''): string {
  return `to_tsvector('${SEARCH_CONFIG}', ${petSearchText(alias)})`
}

/** The pet text a vector is built from (migration 10 concatenates these). */
export function petSearchText(alias = ''): string {
  return (
    `coalesce(${alias}name, '') || ' ' || ` +
    `coalesce(${alias}breed, '') || ' ' || ` +
    `coalesce(${alias}chip_number, '') || ' ' || ` +
    `coalesce(${alias}color, '')`
  )
}

/**
 * One vector holding a pet's and its owner's text. `@@` never crosses two
 * vectors, so an AND-joined phrase whose terms are split between them — a pet
 * name plus the owner's surname, `Moos Kratom` — can only match this. No GIN
 * index covers it: use it for multi-term phrases only, where the indexed
 * per-table branches cannot answer anyway.
 */
export function petAndCustomerSearchVector(
  petAlias = '',
  customerAlias = ''
): string {
  return (
    `to_tsvector('${SEARCH_CONFIG}', ` +
    `${petSearchText(petAlias)} || ' ' || ${customerSearchText(customerAlias)})`
  )
}

/** True when the tsquery AND-joins more than one term. */
export function isMultiTermQuery(tsQueryString: string): boolean {
  return tsQueryString.includes(' & ')
}
