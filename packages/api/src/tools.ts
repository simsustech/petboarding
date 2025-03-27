import { addDays, subMinutes, startOfDay } from 'date-fns'

export function eachDayOfInterval({
  start,
  end = new Date(Date.now())
}: {
  start: Date
  end?: Date
}) {
  const offset = {
    start: start.getTimezoneOffset(),
    end: end.getTimezoneOffset()
  }

  // Adjust start and end dates for timezone offset to use start of UTC date
  const adjusted = {
    start: subMinutes(startOfDay(start.getTime()), offset.start),
    end: subMinutes(startOfDay(end.getTime()), offset.end)
  }

  let accumulator = adjusted.start
  const days: Date[] = []

  while (end >= accumulator) {
    days.push(accumulator)
    accumulator = addDays(accumulator, 1)
  }

  return days
}
