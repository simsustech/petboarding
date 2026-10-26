const langs: Record<
  string,
  () => Promise<{
    default: { booking: { cancelationCosts: string; downPayment: string } }
  }>
> = {
  nl: () => import('./nl.js'),
  en: () => import('./en-US.js'),
  'en-US': () => import('./en-US.js')
}

/**
 * Resolve a deployment locale to its language bundle. Deployments set a full
 * locale (`nl-NL`, `en-US`), so match it case-insensitively first, then fall
 * back to its base language (`nl`), and only then to en-US. Without the base
 * fallback an unlisted full locale — `nl-NL` before this fix — silently
 * produced English labels in a Dutch deployment.
 */
export async function getLang(locale: string) {
  const key = (locale ?? '').trim().toLowerCase()
  const base = key.split('-')[0]

  return langs[key]?.() ?? langs[base]?.() ?? langs['en-US']()
}
