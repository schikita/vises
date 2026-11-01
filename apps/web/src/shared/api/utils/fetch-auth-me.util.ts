import type { UserMeDto } from '@vises/contracts'
import { apiRequest } from '../http-client'

/** Typed skeleton: `GET /auth/me` → Decision 2A `UserMeDto`. */
export const fetchAuthMe = (): Promise<UserMeDto> =>
  apiRequest<UserMeDto>('/auth/me')
