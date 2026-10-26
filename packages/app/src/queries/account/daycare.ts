import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

/**
 * Every upcoming daycare date of the signed-in customer — not the month the
 * calendar happens to show.
 *
 * The page renders the month grid *and* a chronological list from this one set,
 * and the list has to reach past the visible month. Windowing this query to the
 * calendar also made each fetch depend on whichever month had been navigated
 * last (`onChangeDate` wrote `from`/`until`, and @pinia/colada shares those refs
 * with `DaycarePageFabs`), so the same page could render different data for the
 * same customer on consecutive loads. `until: ''` means "no upper bound" to the
 * API, which only filters on the bounds it is given.
 */
export const useAccountGetDaycareDatesQuery = defineQuery(() => {
  const { data: daycareDates, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['accountGetDaycareDates'],
    query: () =>
      trpc.user.getDaycareDates.query({
        from: new Date().toISOString().slice(0, 10),
        until: ''
      })
  })

  return {
    daycareDates,
    ...rest
  }
})
