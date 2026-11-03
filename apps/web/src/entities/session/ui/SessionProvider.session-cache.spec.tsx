import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@/shared/testing'
import type { AuthSessionDto } from '@/shared/api'
import { SessionProvider } from './SessionProvider'
import { useSession } from '../model/use-session'

const onSessionChange = vi.fn()

vi.mock('@/shared/api', async (): Promise<Record<string, unknown>> => {
  const actual = await vi.importActual<typeof import('@/shared/api')>('@/shared/api')
  return {
    ...actual,
    setApiTokenProvider: (): void => undefined,
    fetchAuthMe: async (): Promise<never> => {
      throw new Error('no session')
    },
    postAuthLogin: vi.fn(),
    postAuthRegister: vi.fn(),
    postAuthDemo: vi.fn(),
  }
})

const authUser = (role: 'admin' | 'agent'): AuthSessionDto => ({
  token: `token-${role}`,
  user: {
    id: `id-${role}`,
    name: role,
    firstName: null,
    lastName: null,
    login: role,
    email: `${role}@example.com`,
    role,
    active: true,
    inviteToken: '',
    createdAt: '',
    updatedAt: '',
    password: '',
  },
})

const Probe = (): React.ReactElement => {
  const { ready, logout, loginWithPassword, register, loginDemo } = useSession()
  if (!ready) return <div>loading</div>
  return (
    <div>
      <button
        type="button"
        onClick={(): void => {
          logout()
        }}
      >
        logout
      </button>
      <button
        type="button"
        onClick={(): void => {
          void loginWithPassword('admin', 'x')
        }}
      >
        login
      </button>
      <button
        type="button"
        onClick={(): void => {
          void register({
            login: 'l',
            email: 'l@example.com',
            password: 'secret1',
          })
        }}
      >
        register
      </button>
      <button
        type="button"
        onClick={(): void => {
          void loginDemo('agent')
        }}
      >
        demo
      </button>
    </div>
  )
}

describe('SessionProvider session-cache clear (AC-18a)', (): void => {
  beforeEach(async (): Promise<void> => {
    onSessionChange.mockReset()
    sessionStorage.clear()
    const api = await import('@/shared/api')
    vi.mocked(api.postAuthLogin).mockResolvedValue(authUser('admin'))
    vi.mocked(api.postAuthRegister).mockResolvedValue(authUser('agent'))
    vi.mocked(api.postAuthDemo).mockResolvedValue(authUser('agent'))
  })

  it('invokes onSessionChange on logout and session replacement', async (): Promise<void> => {
    render(
      <SessionProvider onSessionChange={onSessionChange}>
        <Probe />
      </SessionProvider>,
    )

    await waitFor((): void => {
      expect(screen.getByRole('button', { name: 'logout' })).toBeInTheDocument()
    })

    await act(async (): Promise<void> => {
      screen.getByRole('button', { name: 'logout' }).click()
    })
    expect(onSessionChange).toHaveBeenCalledTimes(1)

    onSessionChange.mockClear()
    await act(async (): Promise<void> => {
      screen.getByRole('button', { name: 'login' }).click()
    })
    await waitFor((): void => {
      expect(onSessionChange).toHaveBeenCalledTimes(1)
    })

    onSessionChange.mockClear()
    await act(async (): Promise<void> => {
      screen.getByRole('button', { name: 'register' }).click()
    })
    await waitFor((): void => {
      expect(onSessionChange).toHaveBeenCalledTimes(1)
    })

    onSessionChange.mockClear()
    await act(async (): Promise<void> => {
      screen.getByRole('button', { name: 'demo' }).click()
    })
    await waitFor((): void => {
      expect(onSessionChange).toHaveBeenCalledTimes(1)
    })
  })
})
