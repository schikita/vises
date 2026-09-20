import type { SystemSettings } from '../types'

/** Minsk-only submit cities (owner-console-ux DEC-011). */
export const LOCKED_SUBMIT_CITIES = ['Минск'] as const

export const DEFAULT_SETTINGS: SystemSettings = {
  company: 'Vises',
  defaultPrice: 180,
  cities: [...LOCKED_SUBMIT_CITIES],
  destinations: ['Испания', 'Кипр', 'Франция', 'Италия'],
  webshareProxyEnabled: true,
  websharePlanId: '',
  emailOtpEnabled: true,
  demoControlsEnabled: false,
}
