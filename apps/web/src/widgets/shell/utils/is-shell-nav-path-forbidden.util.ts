import { SHELL_NAV_FORBIDDEN_SEGMENTS } from '../constants/shell-nav.constants'

export const isShellNavPathForbidden = (to: string): boolean => {
  const segments = to.toLowerCase().split('/').filter(Boolean)
  return segments.some((segment) =>
    (SHELL_NAV_FORBIDDEN_SEGMENTS as readonly string[]).includes(segment),
  )
}
