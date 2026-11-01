import type { StatusBadgeTone } from './status-badge.types'

export const resolveStatusBadgeTone = (status: string): StatusBadgeTone => {
  switch (status) {
    case 'drafting':
    case 'new':
      return 'neutral'
    case 'docs':
    case 'review':
      return 'info'
    case 'pending':
    case 'fixes':
      return 'warning'
    case 'ready':
    case 'done':
    case 'issued':
    case 'autofill_ok':
      return 'success'
    case 'booked':
      return 'accent'
    case 'rejected':
    case 'declined':
    case 'autofill_failed':
      return 'danger'
    default:
      return 'neutral'
  }
}
