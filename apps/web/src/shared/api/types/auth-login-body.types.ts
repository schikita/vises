/** `POST /auth/login` body (matches API `LoginDto`). */
export type AuthLoginBody = {
  login: string
  password: string
}
