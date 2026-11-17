import { apiRequest } from '@/shared/api'
import type { SettingsDetailDto } from '../types/settings-detail.types'

/** GET /settings → full settings payload (price + cities/destinations). */
export const fetchSettings = (): Promise<SettingsDetailDto> =>
  apiRequest<SettingsDetailDto>('/settings')
