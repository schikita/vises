/** `POST /auth/register` body (live Nest RegisterDto). */
export type AuthRegisterBody = {
  name: string
  login: string
  password: string
  email?: string
}
