import { publicUrl } from '@/shared/lib'

/** Absolute invite URL for one-time client access (leftover staffCreate copy-link pattern). */
export const buildInviteUrl = (token: string): string => {
  return publicUrl(`/invite/${token}`)
}
