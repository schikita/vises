import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@/shared/testing'
import { PricePerClientHintRender } from './PricePerClientHintRender'

describe('PricePerClientHintRender', (): void => {
  afterEach((): void => {
    cleanup()
  })

  it('shows loading state', (): void => {
    render(
      <PricePerClientHintRender
        loading
        error=""
        pricePerClient={null}
      />,
    )
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('shows API decimal string as-is (AC-13 agent hint)', (): void => {
    render(
      <PricePerClientHintRender
        loading={false}
        error=""
        pricePerClient="180.00"
      />,
    )
    expect(screen.getByRole('note').textContent).toContain('180.00')
  })

  it('shows error state', (): void => {
    render(
      <PricePerClientHintRender
        loading={false}
        error="Forbidden"
        pricePerClient={null}
      />,
    )
    expect(screen.getByRole('alert').textContent).toBe('Forbidden')
  })
})
