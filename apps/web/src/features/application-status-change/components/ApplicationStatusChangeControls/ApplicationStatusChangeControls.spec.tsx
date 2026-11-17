import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, userEvent } from '@/shared/testing'
import { ApplicationStatusChangeControls } from './ApplicationStatusChangeControls'

describe('ApplicationStatusChangeControls (FE10 / AC-9)', (): void => {
  afterEach((): void => {
    cleanup()
  })

  it('does not offer staff transitions for visa_center_monitor from filling', (): void => {
    render(
      <ApplicationStatusChangeControls
        currentStatus="filling"
        actor="visa_center_monitor"
        pending={false}
        apiError=""
        onChangeStatus={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button')).toBeNull()
  })

  it('offers only matrix-legal ready_for_appointment targets for agent', async (): Promise<void> => {
    const onChangeStatus = vi.fn()
    const user = userEvent.setup()

    render(
      <ApplicationStatusChangeControls
        currentStatus="ready_for_appointment"
        actor="agent"
        pending={false}
        apiError=""
        onChangeStatus={onChangeStatus}
      />,
    )

    expect(screen.getAllByRole('button')).toHaveLength(3)

    await user.click(
      screen.getByRole('button', { name: 'Set Not ready for appointment' }),
    )
    expect(onChangeStatus).toHaveBeenCalledWith('not_ready_for_appointment')

    await user.click(screen.getByRole('button', { name: 'Set Booked' }))
    expect(onChangeStatus).toHaveBeenCalledWith('booked')

    await user.click(screen.getByRole('button', { name: 'Set Declined' }))
    expect(onChangeStatus).toHaveBeenCalledWith('declined')
  })

  it('surfaces illegal_transition api error', (): void => {
    render(
      <ApplicationStatusChangeControls
        currentStatus="ready_for_appointment"
        actor="admin"
        pending={false}
        apiError="This status change is not allowed"
        onChangeStatus={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert').textContent).toContain('not allowed')
  })
})
