import type { StaffRole } from '@vises/contracts'
import { apiRequest } from '../http-client'
import type { AuthSessionDto } from '../types'

/** Typed helper: `POST /auth/demo` → session for a StaffRole. */
export const postAuthDemo = (role: StaffRole): Promise<AuthSessionDto> =>
  apiRequest<AuthSessionDto>('/auth/demo', {
    method: 'POST',
    data: { role },
  })
