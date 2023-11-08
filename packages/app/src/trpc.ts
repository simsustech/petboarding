import { computed, reactive } from 'vue'
import { useTRPC } from 'use-trpc'
import { httpLink, getFetch } from '@trpc/client'
import { useOAuthClient } from './oauth.js'
import { Notify } from 'quasar'
import { useLang } from './lang/index.js'

import type { AppRouter } from '@petboarding/api/trpc'

export const createUseTrpc = async () => {
  const oAuthClient = await useOAuthClient()

  const headers = reactive({
    Authorization: computed(() => {
      if (oAuthClient.value) {
        oAuthClient.value.getUser()
        return `Bearer ${oAuthClient.value.getAccessToken()}`
      }
      return ''
    })
  })

  const lang = useLang()
  const fetch = getFetch()
  const handleErrorFetch = async (input, init) => {
    return fetch(input, init).then(async (res) => {
      if (!res.ok) {
        const body = await res.json()
        return Notify.create({
          message: lang.value.serverError,
          caption: body?.error?.message,
          type: 'negative'
        })
      }
      return res
    })
  }
  return useTRPC<AppRouter>({
    client: {
      links: [
        httpLink({
          url: import.meta.env.VITE_API_HOSTNAME
            ? `https://${import.meta.env.VITE_API_HOSTNAME}/trpc`
            : '/trpc',
          headers,
          fetch: handleErrorFetch
        })
      ]
    },
    headers
  })
}
