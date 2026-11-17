import { DEFAULT_SETTINGS } from '../constants'
import type { SettingsDetailDto } from '../types/settings-detail.types'

/** Coerce a partial/unknown settings payload into a stable detail DTO. */
export const normalizeSettingsDetail = (
  dto: Partial<SettingsDetailDto> | null | undefined,
): SettingsDetailDto => {
  const cities = Array.isArray(dto?.cities)
    ? dto.cities.filter(Boolean)
    : [...DEFAULT_SETTINGS.cities]
  const destinations = Array.isArray(dto?.destinations)
    ? dto.destinations.filter(Boolean)
    : [...DEFAULT_SETTINGS.destinations]

  return {
    company: dto?.company?.trim() || DEFAULT_SETTINGS.company,
    price_per_client:
      dto?.price_per_client?.trim() || String(DEFAULT_SETTINGS.defaultPrice),
    cities: cities.length > 0 ? cities : [...DEFAULT_SETTINGS.cities],
    destinations:
      destinations.length > 0
        ? destinations
        : [...DEFAULT_SETTINGS.destinations],
    emailOtpEnabled: Boolean(dto?.emailOtpEnabled),
    demoControlsEnabled: Boolean(dto?.demoControlsEnabled),
  }
}
