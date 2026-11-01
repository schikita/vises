import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, userEvent } from '@/shared/testing'
import { ApplicationStatusChangeControls } from './ApplicationStatusChangeControls'

describe('ApplicationStatusChangeControls (FE10 / AC-9)', (): void => {
  afterEach((): void => {
    cleanup()
  })

  it('does not offer drafting → pending for admin', (): void => {
    render(
      <ApplicationStatusChangeControls
        currentStatus="drafting"
        actor="admin"
        pending={false}
        apiError=""
        onChangeStatus={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button')).toBeNull()
  })

  it('offers only matrix-legal pending targets for agent', async (): Promise<void> => {
    const onChangeStatus = vi.fn()
    const user = userEvent.setup()

    render(
      <ApplicationStatusChangeControls
        currentStatus="pending"
        actor="agent"
        pending={false}
        apiError=""
        onChangeStatus={onChangeStatus}
      />,
    )

    expect(screen.getAllByRole('button')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Set Rejected' }))
    expect(onChangeStatus).toHaveBeenCalledWith('rejected')

    await user.click(screen.getByRole('button', { name: 'Set Booked' }))
    expect(onChangeStatus).toHaveBeenCalledWith('booked')
  })

  it('surfaces illegal_transition api error', (): void => {
    render(
      <ApplicationStatusChangeControls
        currentStatus="pending"
        actor="admin"
        pending={false}
        apiError="This status change is not allowed"
        onChangeStatus={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert').textContent).toContain('not allowed')
  })
})
