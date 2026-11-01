import type { SettingsDto } from '@vises/contracts'
import { apiRequest } from '@/shared/api'

/** GET /settings → contracts `SettingsDto` (`price_per_client` decimal string). */
export const fetchSettings = (): Promise<SettingsDto> =>
  apiRequest<SettingsDto>('/settings')
