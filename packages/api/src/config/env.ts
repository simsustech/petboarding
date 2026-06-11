import { read, required } from './index.js'

export const appConfig = {
  apiHost: required('API_HOST'),

  otpSecret: required('OTP_SECRET'),
  otpValiditySeconds: Number(required('OTP_VALIDITY_SECONDS')),

  oidcIssuerName: read('OIDC_ISSUER_NAME'),
  oidcClientId: read('OIDC_CLIENT_ID') || 'petboarding',
  oidcClientSecret: read('OIDC_CLIENT_SECRET') || 'petboarding',
  oidcCookiesKeys: required('OIDC_COOKIES_KEYS'),

  mailFrom: required('MAIL_FROM'),
  mailHost: required('MAIL_HOST'),
  mailPort: Number(read('MAIL_PORT') || '465'),
  mailSecure: read('MAIL_SECURE') !== 'false',
  mailUser: read('MAIL_USER'),
  mailPass: read('MAIL_PASS'),
  mailReplyTo: read('MAIL_REPLY_TO'),
  mailBcc: read('MAIL_BCC'),
  emailFooter: required('EMAIL_FOOTER'),

  ntfyHost: read('NTFY_HOST'),
  ntfyAccessToken: read('NTFY_ACCESS_TOKEN'),
  sourceColor: read('SOURCE_COLOR'),

  licenseKey: read('LICENSE_KEY'),
  lang: read('VITE_LANG') || 'en-US',
  country: read('COUNTRY') || 'NL',
  title: read('TITLE') || 'Petboarding',
  allowedSpecies: read('ALLOWED_SPECIES')?.split(','),
  daycareDisabledWeekdays: read('DAYCARE_DISABLED_WEEKDAYS')
    ?.split(',')
    .map(Number),
  mandatoryVaccinationsDog: read('MANDATORY_VACCINATIONS_DOG')?.split(','),
  mandatoryVaccinationsCat: read('MANDATORY_VACCINATIONS_CAT')?.split(','),
  termsAndConditionsUrl: read('TERMS_AND_CONDITIONS_URL'),
  unitOfMass: read('UNIT_OF_MASS'),
  currency: read('CURRENCY'),
  supportEmail: read('SUPPORT_EMAIL'),
  slimfactHost: read('SLIMFACT_HOST'),
  slimfactCompanyId: read('SLIMFACT_COMPANY_ID'),

  cancelationPeriodMonths: Number(read('CANCELATION_PERIOD_MONTHS') || '0'),
  downPaymentPaymentTermDays: Number(
    read('DOWN_PAYMENT_PAYMENT_TERM_DAYS') || '5'
  ),

  sassVariablePrimary: read('SASS_VARIABLE_PRIMARY'),
  sassVariableSecondary: read('SASS_VARIABLE_SECONDARY'),
  sassVariableAccent: read('SASS_VARIABLE_ACCENT'),
  sassVariableDark: read('SASS_VARIABLE_DARK'),
  sassVariablePositive: read('SASS_VARIABLE_POSITIVE'),
  sassVariableNegative: read('SASS_VARIABLE_NEGATIVE'),
  sassVariableInfo: read('SASS_VARIABLE_INFO'),
  sassVariableWarning: read('SASS_VARIABLE_WARNING'),

  modularapiDefaultEmail: read('MODULARAPI_DEFAULT_EMAIL'),
  modularapiDefaultPassword: read('MODULARAPI_DEFAULT_PASSWORD'),

  rateLimitPerMinute: read('RATE_LIMIT_PER_MINUTE')
} as const
