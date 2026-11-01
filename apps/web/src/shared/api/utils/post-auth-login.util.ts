import { apiRequest } from '../http-client'
import type { AuthLoginBody, AuthSessionDto } from '../types'

/** Typed helper: `POST /auth/login` → session token + user. */
export const postAuthLogin = (body: AuthLoginBody): Promise<AuthSessionDto> =>
  apiRequest<AuthSessionDto>('/auth/login', {
    method: 'POST',
    data: body,
  })
