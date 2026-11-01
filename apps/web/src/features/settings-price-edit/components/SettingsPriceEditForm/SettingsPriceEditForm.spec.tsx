import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, userEvent } from '@/shared/testing'
import { SettingsPriceEditForm } from './SettingsPriceEditForm'

describe('SettingsPriceEditForm', (): void => {
  afterEach((): void => {
    cleanup()
  })

  it('submits price_per_client as a decimal string (AC-13)', async (): Promise<void> => {
    const onValidSubmit = vi.fn(async (): Promise<boolean> => true)
    const user = userEvent.setup()

    render(
      <SettingsPriceEditForm
        defaultValues={{ price_per_client: '180.00' }}
        apiError=""
        saved={false}
        pending={false}
        onValidSubmit={onValidSubmit}
      />,
    )

    const input = screen.getByRole('textbox')
    expect((input as HTMLInputElement).value).toBe('180.00')

    await user.clear(input)
    await user.type(input, '200.00')
    await user.click(screen.getByRole('button', { name: /save|сохранить/i }))

    expect(onValidSubmit).toHaveBeenCalledWith({ price_per_client: '200.00' })
  })
})
