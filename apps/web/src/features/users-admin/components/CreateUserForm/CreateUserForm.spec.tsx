import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/shared/testing'
import { CreateUserForm } from './CreateUserForm'

describe('CreateUserForm', (): void => {
  afterEach((): void => {
    cleanup()
  })

  it('never offers create-superadmin (AC-6)', (): void => {
    render(
      <CreateUserForm
        apiError=""
        allowedRoles={['admin', 'agent']}
        onValidSubmit={vi.fn(async () => true)}
      />,
    )

    const options = screen.getAllByRole('option').map((el) => el.getAttribute('value'))
    expect(options).toEqual(['admin', 'agent'])
    expect(options).not.toContain('superadmin')
  })

  it('hides admin role when create-admin is not allowed', (): void => {
    render(
      <CreateUserForm
        apiError=""
        allowedRoles={['agent']}
        onValidSubmit={vi.fn(async () => true)}
      />,
    )

    const options = screen.getAllByRole('option').map((el) => el.getAttribute('value'))
    expect(options).toEqual(['agent'])
    expect(options).not.toContain('admin')
    expect(options).not.toContain('superadmin')
  })
})
