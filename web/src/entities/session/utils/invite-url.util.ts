import { publicUrl } from '@/shared/lib'
import { invitePath } from './invite-path.util'

export const inviteUrl = (token: string) => publicUrl(invitePath(token))
