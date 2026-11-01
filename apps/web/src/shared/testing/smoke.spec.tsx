import { describe, expect, it } from 'vitest'
import { render, screen } from '@/shared/testing'

describe('vitest harness', (): void => {
  it('renders with React Testing Library', (): void => {
    render(<p>harness ok</p>)
    expect(screen.getByText('harness ok')).toBeInTheDocument()
  })
})
