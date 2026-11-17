import { apiRequest } from '@/shared/api'
import type { PatchSettingsInput } from '../types/patch-settings-input.types'
import type { SettingsDetailDto } from '../types/settings-detail.types'

/** PATCH /settings — staff-only on the server (`admin` | `superadmin`). */
export const patchSettings = (
  input: PatchSettingsInput,
): Promise<SettingsDetailDto> =>
  apiRequest<SettingsDetailDto>('/settings', {
    method: 'PATCH',
    data: input,
  })
