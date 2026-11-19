/** `POST /auth/register` body (matches API `RegisterDto`). */
export type AuthRegisterBody = {
  name: string
  login: string
  password: string
  email?: string
}
