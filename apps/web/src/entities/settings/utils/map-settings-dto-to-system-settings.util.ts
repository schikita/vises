import type { SystemSettings } from '../types'
import { DEFAULT_SETTINGS } from '../constants'

type SettingsApiDto = {
  company?: string
  defaultPrice?: number
  price_per_client?: string
  cities?: string[]
  destinations?: string[]
  emailOtpEnabled?: boolean
  demoControlsEnabled?: boolean
}

/** Map GET/PATCH `/settings` payload onto local `SystemSettings`. */
export const mapSettingsDtoToSystemSettings = (
  dto: SettingsApiDto,
): SystemSettings => {
  const fromPricePerClient = Number.parseInt(
    String(dto.price_per_client ?? '').split('.')[0] ?? '',
    10,
  )
  return {
    company: dto.company?.trim() || DEFAULT_SETTINGS.company,
    defaultPrice: Number.isFinite(dto.defaultPrice)
      ? Number(dto.defaultPrice)
      : Number.isFinite(fromPricePerClient)
        ? fromPricePerClient
        : DEFAULT_SETTINGS.defaultPrice,
    cities: Array.isArray(dto.cities) ? dto.cities.filter(Boolean) : [...DEFAULT_SETTINGS.cities],
    destinations: Array.isArray(dto.destinations)
      ? dto.destinations.filter(Boolean)
      : [...DEFAULT_SETTINGS.destinations],
    emailOtpEnabled: Boolean(dto.emailOtpEnabled),
    demoControlsEnabled: Boolean(dto.demoControlsEnabled),
  }
}
