import { BLS_WORKFLOW_PANEL_COPY as copy } from './constants'
import type { BlsWorkflowBookingHandoffRenderProps } from './types'

/**
 * Success/handoff banner for AWAITING_STAFF_BOOKING (CON-006 / DEC-005).
 * Staff must finish booking manually — never claims full automation.
 */
export const BlsWorkflowBookingHandoffRender = ({
  terminalReason,
}: BlsWorkflowBookingHandoffRenderProps) => {
  const reason =
    terminalReason != null && terminalReason.trim() !== ''
      ? terminalReason.trim()
      : null

  return (
    <div
      role="status"
      className="rounded-xl border border-[#b7d9c4] bg-[#e4f3ea]/70 px-4 py-3 text-sm"
    >
      <p className="font-bold text-leaf">{copy.bookingHandoffLead}</p>
      <p className="mt-1 text-ink">{copy.bookingHandoffBody}</p>
      <p className="mt-1 text-muted">{copy.bookingHandoffDetail}</p>
      {reason ? (
        <p className="mt-2 text-xs text-muted">
          <span className="font-semibold">{copy.terminalReason}: </span>
          {reason}
        </p>
      ) : null}
    </div>
  )
}
