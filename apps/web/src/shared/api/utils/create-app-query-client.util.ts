import { QueryClient } from '@tanstack/react-query'

/** App-owned QueryClient factory (FR-15). No persistence to web storage. */
export const createAppQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })
