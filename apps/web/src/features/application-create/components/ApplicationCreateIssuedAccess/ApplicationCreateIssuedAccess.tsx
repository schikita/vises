import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Link2 } from 'lucide-react'
import { Btn, Card } from '@/shared/ui'
import { ISSUED_ACCESS_COPIED_FEEDBACK_MS } from '../../constants'
import type { ApplicationCreateIssuedAccessProps } from '../../types'
import { buildInviteUrl, formatIssuedAccessClipboard } from '../../utils'

/**
 * One-time Path B credentials panel (DEC-ACU-006 / AC-ACU-008).
 * Reuses leftover staffCreate.* copy; does not log secrets.
 */
export const ApplicationCreateIssuedAccess = ({
  issued,
  onGoToApp,
}: ApplicationCreateIssuedAccessProps): React.ReactElement => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const inviteLink = buildInviteUrl(issued.token)

  useEffect((): (() => void) | undefined => {
    if (!copied) {
      return undefined
    }
    const timerId = window.setTimeout((): void => {
      setCopied(false)
    }, ISSUED_ACCESS_COPIED_FEEDBACK_MS)
    return (): void => {
      window.clearTimeout(timerId)
    }
  }, [copied])

  const markCopied = (): void => {
    setCopied(true)
  }

  const handleCopyLink = (): void => {
    void navigator.clipboard.writeText(inviteLink)
    markCopied()
  }

  const handleCopyAll = (): void => {
    void navigator.clipboard.writeText(
      formatIssuedAccessClipboard({
        loginLabel: t('staffCreate.login'),
        passwordLabel: t('staffCreate.password'),
        login: issued.user.login,
        password: issued.password,
        link: inviteLink,
      }),
    )
    markCopied()
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-text">
          {t('staffCreate.createdTitle')}
        </h1>
        <p className="text-sm text-text-secondary">
          {t('staffCreate.createdSubtitle')}
        </p>
      </header>
      <Card className="rounded-panel border border-accent/30 bg-accent-subtle px-5 py-5">
        <p className="font-semibold text-text">
          {t('staffCreate.accessFor', { name: issued.user.name })}
        </p>
        <p className="mt-2 text-sm text-text">
          {t('staffCreate.login')}: <b>{issued.user.login}</b>
        </p>
        <p className="text-sm text-text">
          {t('staffCreate.password')}: <b>{issued.password}</b>
        </p>
        <p className="mt-2 break-all text-xs text-text-secondary">{inviteLink}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn type="button" onClick={handleCopyLink}>
            <Link2 size={14} />
            {copied ? t('staffCreate.copied') : t('staffCreate.copyLink')}
          </Btn>
          <Btn type="button" variant="ghost" onClick={handleCopyAll}>
            <Copy size={14} />
            {t('staffCreate.copyAll')}
          </Btn>
        </div>
      </Card>
      <div className="flex justify-end">
        <Btn type="button" onClick={onGoToApp}>
          {t('staffCreate.goToApp')}
        </Btn>
      </div>
    </section>
  )
}
