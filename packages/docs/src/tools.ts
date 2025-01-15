import { useQuasar } from 'quasar'

const dateFormatter = ({
  date,
  locale,
  options
}: {
  date: Date
  locale: string
  options?: Intl.DateTimeFormatOptions
}) =>
  new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(date)

export const formatDate = (
  date: string | null,
  options?: Intl.DateTimeFormatOptions
) => {
  const $q = useQuasar()
  if (date)
    return dateFormatter({
      date: new Date(date),
      locale: $q.lang.isoName,
      options
    })
  return '-'
}
