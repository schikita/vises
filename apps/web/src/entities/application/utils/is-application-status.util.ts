import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from '@vises/contracts'

/** Type guard for frozen ApplicationStatus union (FR-6 / AC-9). */
export const isApplicationStatus = (value: string): value is ApplicationStatus =>
  (APPLICATION_STATUSES as readonly string[]).includes(value)
