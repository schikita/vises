import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { Session } from '@/entities/session'
import { render, screen, userEvent, waitFor } from '@/shared/testing'
import { RegisterPage } from './Register'

const register = vi.fn()

vi.mock('@/entities/session', async (): Promise<Record<string, unknown>> => {
  const actual = await vi.importActual<typeof import('@/entities/session')>(
    '@/entities/session',
  )
  return {
    ...actual,
    useSession: (): {
      session: Session | null
      ready: boolean
      loginWithPassword: () => Promise<string>
      loginDemo: () => Promise<string>
      register: typeof register
      logout: () => void
    } => ({
      session: null,
      ready: true,
      loginWithPassword: async (): Promise<string> => 'unused',
      loginDemo: async (): Promise<string> => 'unused',
      register,
      logout: (): void => undefined,
    }),
  }
})

describe('RegisterPage (AC-5)', (): void => {
  beforeEach((): void => {
    register.mockReset()
  })

  it('registers an agent and navigates to /app', async (): Promise<void> => {
    const user = userEvent.setup()
    register.mockResolvedValue({
      userId: 'u-agent',
      role: 'agent',
      name: 'New Agent',
      email: 'new@example.com',
      login: 'newagent',
      active: true,
      balance: '0.00',
    } satisfies Session)

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/app" element={<div>Agent shell</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/^Name$/i), 'New Agent')
    await user.type(screen.getByLabelText(/^Login$/i), 'newagent')
    await user.type(screen.getByLabelText(/^Password$/i), 'secret1')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor((): void => {
      expect(register).toHaveBeenCalledWith({
        name: 'New Agent',
        login: 'newagent',
        password: 'secret1',
      })
      expect(screen.getByText('Agent shell')).toBeInTheDocument()
    })
  })
})
