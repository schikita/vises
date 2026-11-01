import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { Session } from '@/entities/session'
import { cleanup, render, screen, userEvent, waitFor } from '@/shared/testing'
import { Landing } from './Landing'

const loginWithPassword = vi.fn()
const loginDemo = vi.fn()

const mockSessionState: {
  session: Session | null
  ready: boolean
} = {
  session: null,
  ready: true,
}

vi.mock('@/entities/session', async (): Promise<Record<string, unknown>> => {
  const actual = await vi.importActual<typeof import('@/entities/session')>(
    '@/entities/session',
  )
  return {
    ...actual,
    useSession: (): {
      session: Session | null
      ready: boolean
      loginWithPassword: typeof loginWithPassword
      loginDemo: typeof loginDemo
      register: () => Promise<string>
      logout: () => void
    } => ({
      session: mockSessionState.session,
      ready: mockSessionState.ready,
      loginWithPassword,
      loginDemo,
      register: async (): Promise<string> => 'unused',
      logout: (): void => undefined,
    }),
  }
})

const renderLanding = (): void => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<div>Admin home</div>} />
        <Route path="/app" element={<div>Agent home</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Landing login redirects (AC-2)', (): void => {
  afterEach((): void => {
    cleanup()
  })

  beforeEach((): void => {
    loginWithPassword.mockReset()
    loginDemo.mockReset()
    mockSessionState.session = null
    mockSessionState.ready = true
  })

  it('redirects admin login to /admin', async (): Promise<void> => {
    const user = userEvent.setup()
    loginWithPassword.mockResolvedValue({
      userId: 'u1',
      role: 'admin',
      name: 'Admin',
      email: 'admin@example.com',
      login: 'admin',
      active: true,
      balance: null,
    } satisfies Session)

    renderLanding()
    await user.type(screen.getByLabelText(/логин/i), 'admin')
    await user.type(screen.getByLabelText(/пароль/i), 'secret')
    await user.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor((): void => {
      expect(screen.getByText('Admin home')).toBeInTheDocument()
    })
  })

  it('redirects agent login to /app', async (): Promise<void> => {
    const user = userEvent.setup()
    loginWithPassword.mockResolvedValue({
      userId: 'u2',
      role: 'agent',
      name: 'Agent',
      email: 'agent@example.com',
      login: 'agent',
      active: true,
      balance: '0.00',
    } satisfies Session)

    renderLanding()
    await user.type(screen.getByLabelText(/логин/i), 'agent')
    await user.type(screen.getByLabelText(/пароль/i), 'secret')
    await user.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor((): void => {
      expect(screen.getByText('Agent home')).toBeInTheDocument()
    })
  })
})

describe('Landing session restore redirects (AC-2 / FR-1.4)', (): void => {
  afterEach((): void => {
    cleanup()
  })

  beforeEach((): void => {
    loginWithPassword.mockReset()
    loginDemo.mockReset()
    mockSessionState.ready = true
  })

  it('redirects restored admin session to /admin', async (): Promise<void> => {
    mockSessionState.session = {
      userId: 'u1',
      role: 'admin',
      name: 'Admin',
      email: 'admin@example.com',
      login: 'admin',
      active: true,
      balance: null,
    } satisfies Session

    renderLanding()

    await waitFor((): void => {
      expect(screen.getByText('Admin home')).toBeInTheDocument()
    })
  })

  it('redirects restored agent session to /app', async (): Promise<void> => {
    mockSessionState.session = {
      userId: 'u2',
      role: 'agent',
      name: 'Agent',
      email: 'agent@example.com',
      login: 'agent',
      active: true,
      balance: '0.00',
    } satisfies Session

    renderLanding()

    await waitFor((): void => {
      expect(screen.getByText('Agent home')).toBeInTheDocument()
    })
  })

  it('redirects restored superadmin session to /admin', async (): Promise<void> => {
    mockSessionState.session = {
      userId: 'u3',
      role: 'superadmin',
      name: 'Super',
      email: 'super@example.com',
      login: 'super',
      active: true,
      balance: null,
    } satisfies Session

    renderLanding()

    await waitFor((): void => {
      expect(screen.getByText('Admin home')).toBeInTheDocument()
    })
  })
})
