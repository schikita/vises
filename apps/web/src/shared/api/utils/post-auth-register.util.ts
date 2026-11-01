import { apiRequest } from '../http-client'
import type { AuthRegisterBody, AuthSessionDto } from '../types'

/** Typed helper: `POST /auth/register` → agent session. */
export const postAuthRegister = (body: AuthRegisterBody): Promise<AuthSessionDto> =>
  apiRequest<AuthSessionDto>('/auth/register', {
    method: 'POST',
    data: body,
  })
