import { useTranslation } from 'react-i18next'
import { initials } from '@/shared/lib'
import { AVATAR_DEFAULT_SIZE } from './avatar.constants'
import type { AvatarProps } from './avatar.types'

export const Avatar = (props: AvatarProps): React.ReactElement => {
  const { name, size = AVATAR_DEFAULT_SIZE } = props
  const { t } = useTranslation()
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-control bg-accent font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {initials(name) || t('chrome.avatar.emptyInitials')}
    </div>
  )
}
