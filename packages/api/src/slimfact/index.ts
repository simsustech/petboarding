import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { FastifyInstance } from 'fastify'
import type { AppRouter } from './slimfact'
import type { TokenSet } from '@modular-api/api'

declare module 'fastify' {
  export interface FastifyInstance {
    slimfact: ReturnType<typeof createSlimfactTrpcClient>
  }
}

let newTokenSetPromise: Promise<TokenSet | null>
export const createSlimfactTrpcClient = ({
  hostname,
  fastify
}: {
  hostname: string
  fastify: FastifyInstance
}) => {
  const handleErrorFetch = async (
    input: string | URL | Request,
    init?: RequestInit | undefined,
    recursive?: boolean
  ): Promise<Response> => {
    return fetch(input, init).then(async (res) => {
      if (!res.ok && !recursive) {
        if (res.status === 401) {
          console.error('SlimFact not authorized, refreshing token set')
          try {
            await newTokenSetPromise
            const tokenSet = await fastify.oidcClients?.slimfact.getTokenSet()
            if (tokenSet) {
              newTokenSetPromise =
                fastify.oidcClients?.slimfact.refreshTokenSet()
              const newTokenSet = await newTokenSetPromise
              return handleErrorFetch(
                input,
                {
                  ...init,
                  headers: {
                    ...init?.headers,
                    Authorization: `Bearer ${newTokenSet?.accessToken}`
                  }
                },
                true
              )
            }
            fastify.log.info('Refreshed SlimFact access token')
          } catch (e) {
            console.error(e)
            fastify.log.debug('Unable to refresh SlimFact token set')
          }
        }
      }
      return res
    })
  }

  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${hostname}/trpc`,
        // You can pass any HTTP headers you wish here
        async headers() {
          const tokenSet = await fastify.oidcClients?.slimfact.getTokenSet()
          return {
            Authorization: tokenSet?.accessToken
              ? `Bearer ${tokenSet?.accessToken}`
              : ''
          }
        },
        fetch: handleErrorFetch
      })
    ]
  })

  // getter required
  fastify.decorate('slimfact', {
    getter() {
      return client
    }
  })

  return client
}
