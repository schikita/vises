import type { FormatIssuedAccessClipboardInput } from '../types'

/** Builds clipboard text for login/password/link. Does not log secrets. */
export const formatIssuedAccessClipboard = (
  input: FormatIssuedAccessClipboardInput,
): string => {
  return `${input.loginLabel}: ${input.login}\n${input.passwordLabel}: ${input.password}\n${input.link}`
}
