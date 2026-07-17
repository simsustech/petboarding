const langs: Record<
  string,
  () => Promise<{ default: { booking: { cancelationCosts: string } } }>
> = {
  nl: () => import('./nl.js'),
  en: () => import('./en-US.js'),
  'en-US': () => import('./en-US.js')
}

export async function getLang(locale: string) {
  return langs[locale]?.() ?? langs['en-US']()
}
