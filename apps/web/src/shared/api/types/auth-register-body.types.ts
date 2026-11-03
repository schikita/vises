/** `POST /auth/register` body (live Nest RegisterDto). */
export type AuthRegisterBody = {
  login: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}
