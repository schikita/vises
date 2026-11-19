import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { resolveApiErrorI18nKey } from '@/shared/api'
import { Empty } from '@/shared/ui'
import type { ApplicationCreateProps } from '../../types'
import { startApplicationCreate } from '../../utils'

/**
 * Staff Path B create: POST /apps with no id and no client email.
 * On success the page opens the portal form, where the applicant email is entered.
 */
export const ApplicationCreate = ({
  upsert,
  onCreated,
}: ApplicationCreateProps): React.ReactElement => {
  const { t } = useTranslation()
  const [apiError, setApiError] = useState('')

  useEffect((): (() => void) => {
    let active = true

    void startApplicationCreate(upsert)
      .then((result): void => {
        if (!active) {
          return
        }
        const clientId = result.clientId?.trim() ?? ''
        if (clientId.length === 0) {
          setApiError(t('staffCreate.openFormFailed'))
          return
        }
        onCreated(result)
      })
      .catch((err: unknown): void => {
        if (!active) {
          return
        }
        setApiError(t(resolveApiErrorI18nKey(err)))
      })

    return (): void => {
      active = false
    }
  }, [onCreated, t, upsert])

  if (apiError) {
    return (
      <section className="space-y-4">
        <h1 className="text-xl font-semibold text-text">{t('staffCreate.title')}</h1>
        <p className="text-sm font-medium text-danger" role="alert">
          {apiError}
        </p>
      </section>
    )
  }

  return (
    <Empty
      title={t('staffCreate.openingFormTitle')}
      text={t('staffCreate.openingForm')}
    />
  )
}
