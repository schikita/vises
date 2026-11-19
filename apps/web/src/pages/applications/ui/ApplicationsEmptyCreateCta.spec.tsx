import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@/shared/testing'
import { ApplicationsEmptyCreateCta } from './ApplicationsEmptyCreateCta'

describe('ApplicationsEmptyCreateCta (ACU-TASK-001)', (): void => {
  it('links staff create CTA to /admin/apps/new', (): void => {
    render(
      <MemoryRouter>
        <ApplicationsEmptyCreateCta
          to="/admin/apps/new"
          label="Create application"
        />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: /create application/i })
    expect(link).toHaveAttribute('href', '/admin/apps/new')
  })

  it('links agent create CTA to /app/clients', (): void => {
    render(
      <MemoryRouter>
        <ApplicationsEmptyCreateCta to="/app/clients" label="New client" />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: /new client/i })
    expect(link).toHaveAttribute('href', '/app/clients')
  })
})
