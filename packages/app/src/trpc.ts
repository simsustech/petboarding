import {
  createTRPCClient,
  httpBatchLink,
  getFetch,
  type TRPCClient,
  TRPCClientError
} from '@trpc/client'
import { useOAuthClient, user } from './oauth.js'
import { Notify } from 'quasar'
import { useLang } from './lang/index.js'
import type { AppRouter } from '@petboarding/api/trpc'

export const initializeTRPCClient = async (apiHost: string) => {
  const oAuthClient = await useOAuthClient()
  const headers = () =>
    user
      ? {
          Authorization: `Bearer ${oAuthClient.value?.getAccessToken()}`
        }
      : {}

  const lang = useLang()
  const fetch = getFetch()

  const handleErrorFetch = async (input, init) => {
    return fetch(input, init).then(async (res) => {
      try {
        if (!res.ok) {
          const body = await res.clone().json()

          const serverErrors = body?.error || body?.[0]?.error
          let caption: string
          const { message, code, path, expected, received } = serverErrors
          if (message) {
            caption = message
          } else if (path && lang.value.errors?.[code]) {
            caption = lang.value.errors[code]({ path, expected, received })
          } else if (path) {
            caption = `${message}: ${path.join(':')}`
          } else {
            caption = ''
          }
          Notify.create({
            message: lang.value.serverError,
            caption,
            type: 'negative'
          })
        }
        return res
      } catch (e) {
        console.error(e)
        return res
      }
    })
  }

  const host = `https://${apiHost}`

  trpc = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: new URL('/trpc', host),
        fetch: handleErrorFetch,
        headers
      })
    ]
  })
}

export let trpc: TRPCClient<AppRouter>

export function isTRPCClientError(
  cause: unknown
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError
}

// import { useTRPC } from 'use-trpc'
// export const createUseTrpc = async () => {
//   const oAuthClient = await useOAuthClient()

//   const headers = () => ({
//     Authorization: oAuthClient.value?.getAccessToken()
//       ? `Bearer ${oAuthClient.value.getAccessToken()}`
//       : ''
//   })

//   const lang = useLang()
//   const fetch = getFetch()
//   const handleErrorFetch = async (input, init) => {
//     return fetch(input, init).then(async (res) => {
//       try {
//         if (!res.ok) {
//           const body = await res.clone().json()

//           const serverErrors = body?.error || body?.[0]?.error
//           let caption: string
//           if (serverErrors) {
//             const { message, code, path, expected, received } = serverErrors
//             if (message) {
//               caption = message
//             } else if (path && lang.value.errors?.[code]) {
//               caption = lang.value.errors[code]({ path, expected, received })
//             } else if (path) {
//               caption = `${message}: ${path.join(':')}`
//             } else {
//               caption = ''
//             }
//             Notify.create({
//               message: lang.value.serverError,
//               caption,
//               icon: 'i-mdi-alert',
//               color: 'negative'
//             })
//           }
//         }
//         return res
//       } catch (e) {
//         console.error(e)
//         return res
//       }
//     })
//   }
//   return useTRPC<AppRouter>({
//     client: {
//       links: [
//         httpBatchLink({
//           url: import.meta.env.VITE_API_HOST
//             ? `https://${import.meta.env.VITE_API_HOST}/trpc`
//             : '/trpc',
//           headers,
//           fetch: handleErrorFetch
//         })
//       ]
//     },
//     headers
//   })
// }
