import type { StatusBadgeTone } from './status-badge.types'

export const STATUS_BADGE_BASE_CLASS =
  'inline-flex rounded-control px-2.5 py-1 text-xs font-medium'

export const STATUS_BADGE_TONE_CLASS: Record<StatusBadgeTone, string> = {
  neutral: 'bg-accent-subtle text-text-secondary',
  info: 'bg-accent-subtle text-accent',
  success: 'bg-accent-subtle text-success',
  warning: 'bg-accent-subtle text-warning',
  danger: 'bg-accent-subtle text-danger',
  accent: 'bg-accent-subtle text-accent',
}
