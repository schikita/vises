import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveApiErrorI18nKey } from '@/shared/api'
import { i18n } from '@/shared/i18n'
import { cleanup, render, screen, userEvent } from '@/shared/testing'
import { ClientCreateForm } from './ClientCreateForm'

describe('ClientCreateForm', (): void => {
  afterEach((): void => {
    cleanup()
  })

  it('surfaces insufficient_balance on create (AC-7 / AC-20)', (): void => {
    const message = i18n.t(
      resolveApiErrorI18nKey({ detail: 'insufficient_balance' }),
    )

    render(
      <ClientCreateForm
        apiError={message}
        pending={false}
        priceHint={null}
        onValidSubmit={vi.fn(async (): Promise<boolean> => false)}
      />,
    )

    expect(screen.getByRole('alert').textContent).toBe(message)
    expect(message.toLowerCase()).toContain('insufficient')
  })

  it('submits create form values', async (): Promise<void> => {
    const onValidSubmit = vi.fn(async (): Promise<boolean> => true)
    const user = userEvent.setup()

    render(
      <ClientCreateForm
        apiError=""
        pending={false}
        priceHint={null}
        onValidSubmit={onValidSubmit}
      />,
    )

    await user.type(screen.getByLabelText(/email/i), 'a@example.com')
    await user.type(screen.getByLabelText(/phone/i), '+375291234567')
    await user.click(screen.getByRole('button', { name: /create|создать/i }))

    expect(onValidSubmit).toHaveBeenCalledWith({
      email: 'a@example.com',
      phone: '+375291234567',
      address: '',
      purpose: '',
    })
  })
})
