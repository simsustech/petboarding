import { useTRPC } from 'use-trpc'
import { httpLink, getFetch } from '@trpc/client'
import { useOAuthClient } from './oauth.js'
import { Notify } from 'quasar'
import { useLang } from './lang/index.js'

import type { AppRouter } from '@petboarding/api/trpc'

export const createUseTrpc = async () => {
  const oAuthClient = await useOAuthClient()

  const headers = () => ({
    Authorization: oAuthClient.value?.getAccessToken()
      ? `Bearer ${oAuthClient.value.getAccessToken()}`
      : ''
  })

  const lang = useLang()
  const fetch = getFetch()
  const handleErrorFetch = async (input, init) => {
    return fetch(input, init).then(async (res) => {
      if (!res.ok) {
        const body = await res.json()

        const serverErrors = JSON.parse(body?.error.message)
        for (const index in serverErrors) {
          let caption: string
          const { message, code, path, expected, received } =
            serverErrors[index]
          if (lang.value.errors?.[code]) {
            caption = lang.value.errors[code]({ path, expected, received })
          } else {
            caption = `${message}: ${path.join(':')}`
          }
          Notify.create({
            message: lang.value.serverError,
            caption,
            type: 'negative'
          })
        }
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
