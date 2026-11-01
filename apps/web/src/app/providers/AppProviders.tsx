import { useMemo, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from '@/entities/session'
import { createAppQueryClient } from '@/shared/api'
import { StoreProvider } from '@/widgets/app-store'
import type { AppProvidersProps } from './types/app-providers.types'

/**
 * App-layer providers: QueryClient (FR-15 / AC-18) + session + transitional store.
 * Lower layers import session/store hooks from entities/widgets — never `@/app/*`.
 */
export const AppProviders = ({ children }: AppProvidersProps): React.ReactElement => {
  const [queryClient] = useState(() => createAppQueryClient())
  const onSessionChange = useMemo(
    () => (): void => {
      queryClient.clear()
    },
    [queryClient],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider onSessionChange={onSessionChange}>
        <StoreProvider>{children}</StoreProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
