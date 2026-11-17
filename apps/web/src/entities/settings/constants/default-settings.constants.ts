import type { SystemSettings } from '../types'

/** Default submit cities seed (editable in Settings by admin/superadmin). */
export const LOCKED_SUBMIT_CITIES = ['Минск'] as const

/** Default destinations seed (editable in Settings by admin/superadmin). */
export const DEFAULT_DESTINATIONS = ['Испания'] as const

export const DEFAULT_SETTINGS: SystemSettings = {
  company: 'Vises',
  defaultPrice: 180,
  cities: [...LOCKED_SUBMIT_CITIES],
  destinations: [...DEFAULT_DESTINATIONS],
  emailOtpEnabled: true,
  demoControlsEnabled: false,
}
