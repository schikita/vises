import type { StatusBadgeTone } from './status-badge.types'

/** Tone map for BUSINESS `ApplicationStatus` ids (§4.A). */
export const resolveStatusBadgeTone = (status: string): StatusBadgeTone => {
  switch (status) {
    case 'draft':
      return 'neutral'
    case 'not_ready_for_appointment':
      return 'info'
    case 'filling':
      return 'warning'
    case 'ready_for_appointment':
      return 'success'
    case 'booked':
      return 'accent'
    case 'declined':
      return 'danger'
    default:
      return 'neutral'
  }
}
