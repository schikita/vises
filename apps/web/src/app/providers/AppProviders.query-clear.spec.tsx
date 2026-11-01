import { describe, expect, it, vi } from 'vitest'
import { render } from '@/shared/testing'
import { AppProviders } from './AppProviders'

const clear = vi.fn()

vi.mock('@/shared/api', async (): Promise<Record<string, unknown>> => {
  const actual = await vi.importActual<typeof import('@/shared/api')>('@/shared/api')
  return {
    ...actual,
    createAppQueryClient: (): { clear: typeof clear } => ({ clear }),
    setApiTokenProvider: (): void => undefined,
    fetchAuthMe: async (): Promise<never> => {
      throw new Error('no session')
    },
  }
})

vi.mock('@/entities/session', async (): Promise<Record<string, unknown>> => {
  const actual = await vi.importActual<typeof import('@/entities/session')>(
    '@/entities/session',
  )
  return {
    ...actual,
    SessionProvider: ({
      children,
      onSessionChange,
    }: {
      children: React.ReactNode
      onSessionChange?: () => void
    }): React.ReactElement => {
      ;(globalThis as { __fe4OnSessionChange?: () => void }).__fe4OnSessionChange =
        onSessionChange
      return <>{children}</>
    },
  }
})

vi.mock('@/widgets/app-store', (): Record<string, unknown> => ({
  StoreProvider: ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <>{children}</>
  ),
}))

vi.mock('@tanstack/react-query', async (): Promise<Record<string, unknown>> => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>(
    '@tanstack/react-query',
  )
  return {
    ...actual,
    QueryClientProvider: ({ children }: { children: React.ReactNode }): React.ReactElement => (
      <>{children}</>
    ),
  }
})

describe('AppProviders QueryClient wiring (AC-18 / AC-18a)', (): void => {
  it('owns a QueryClient and clears it via onSessionChange', (): void => {
    clear.mockReset()
    render(
      <AppProviders>
        <div>child</div>
      </AppProviders>,
    )

    const onSessionChange = (globalThis as { __fe4OnSessionChange?: () => void })
      .__fe4OnSessionChange
    expect(typeof onSessionChange).toBe('function')
    onSessionChange?.()
    expect(clear).toHaveBeenCalledTimes(1)
  })
})
