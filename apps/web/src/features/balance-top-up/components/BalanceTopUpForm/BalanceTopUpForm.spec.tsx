import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, userEvent } from '@/shared/testing'
import { BalanceTopUpForm } from './BalanceTopUpForm'

describe('BalanceTopUpForm', (): void => {
  afterEach((): void => {
    cleanup()
  })

  it('submits positive amount as a decimal string (AC-10 top-up happy path)', async (): Promise<void> => {
    const onValidSubmit = vi.fn(async (): Promise<boolean> => true)
    const user = userEvent.setup()

    render(
      <BalanceTopUpForm
        apiError=""
        saved={false}
        pending={false}
        onValidSubmit={onValidSubmit}
      />,
    )

    const input = screen.getByRole('textbox')
    await user.type(input, '250.50')
    await user.click(screen.getByRole('button', { name: /top up|пополнить/i }))

    expect(onValidSubmit).toHaveBeenCalledWith({ amount: '250.50' })
  })
})
