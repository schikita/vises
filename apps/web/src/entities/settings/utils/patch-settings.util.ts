import type { SettingsDto } from '@vises/contracts'
import { apiRequest } from '@/shared/api'
import type { PatchSettingsInput } from '../types/patch-settings-input.types'

/** PATCH /settings — staff-only on the server (`admin` | `superadmin`). */
export const patchSettings = (input: PatchSettingsInput): Promise<SettingsDto> =>
  apiRequest<SettingsDto>('/settings', {
    method: 'PATCH',
    data: input,
  })
