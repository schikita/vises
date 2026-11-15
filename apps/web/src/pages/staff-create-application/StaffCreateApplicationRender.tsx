import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Copy, Link2 } from 'lucide-react'
import { inviteUrl } from '@/entities/session'
import {
  getNestedFormError,
  PortalOnePageFormSections,
} from '@/features/application-form'
import { Btn, Card, Field } from '@/shared/ui'
import type { StaffCreateApplicationRenderProps } from './types/staff-create-application-render.types'
import { formatClientListOptionLabel } from './utils'

export const StaffCreateApplicationRender = ({
  saving,
  error,
  issued,
  createdAppId,
  copied,
  staffAppsBase,
  clients,
  clientsLoading,
  clientsError,
  selectedClientId,
  register,
  errors,
  onSelectedClientIdChange,
  onSubmit,
  onBack,
  onCopyLink,
  onCopyAll,
  onGoToCreatedApp,
}: StaffCreateApplicationRenderProps): ReactElement => {
  const { t } = useTranslation()

  if (issued && createdAppId) {
    return (
      <div className="mx-auto max-w-4xl">
        <Link
          to={staffAppsBase}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted"
        >
          <ArrowLeft size={14} /> {t('staffCreate.backToApps')}
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
          {t('staffCreate.createdTitle')}
        </h1>
        <p className="mt-1 text-sm text-muted">{t('staffCreate.createdSubtitle')}</p>
        {error ? <p className="mt-4 text-sm font-semibold text-clay">{error}</p> : null}
        <Card className="mt-6 border-leaf/40 bg-[#f3f8f5]">
          <p className="font-bold">{t('staffCreate.accessFor', { name: issued.user.name })}</p>
          <p className="mt-2 text-sm">
            {t('staffCreate.login')}: <b>{issued.user.login}</b>
          </p>
          <p className="text-sm">
            {t('staffCreate.password')}: <b>{issued.password}</b>
          </p>
          <p className="mt-2 break-all text-xs text-muted">{inviteUrl(issued.token)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn onClick={() => onCopyLink(issued.token)}>
              <Link2 size={14} />
              {copied ? t('staffCreate.copied') : t('staffCreate.copyLink')}
            </Btn>
            <Btn variant="ghost" className="bg-white" onClick={onCopyAll}>
              <Copy size={14} />
              {t('staffCreate.copyAll')}
            </Btn>
          </div>
        </Card>
        <div className="mt-4 flex justify-end">
          <Btn onClick={onGoToCreatedApp}>{t('staffCreate.goToApp')}</Btn>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to={staffAppsBase}
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted"
      >
        <ArrowLeft size={14} /> {t('staffCreate.backToApps')}
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">{t('staffCreate.title')}</h1>
      <p className="mt-1 text-sm text-muted">{t('staffCreate.subtitleOnePage')}</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <Card>
          <Field label={t('staffCreate.fields.existingClient')}>
            <select
              className="field"
              value={selectedClientId}
              disabled={clientsLoading}
              onChange={(e) => onSelectedClientIdChange(e.target.value)}
            >
              <option value="">{t('staffCreate.fields.existingClientEmpty')}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {formatClientListOptionLabel(client)}
                </option>
              ))}
            </select>
          </Field>
          <p className="mt-2 text-xs text-muted">
            {clientsLoading
              ? t('staffCreate.fields.existingClientLoading')
              : clientsError
                ? clientsError
                : t('staffCreate.fields.existingClientHint')}
          </p>
        </Card>

        <Card>
          <Field
            label={t('staffCreate.fields.clientEmail')}
            required
            error={getNestedFormError(errors, 'clientEmail')}
          >
            <input
              className="field"
              type="email"
              placeholder={t('staffCreate.fields.clientEmailPlaceholder')}
              autoComplete="email"
              {...register('clientEmail')}
            />
          </Field>
          <p className="mt-2 text-xs text-muted">{t('staffCreate.fields.clientEmailHint')}</p>
        </Card>

        <PortalOnePageFormSections title={t('staffCreate.portalFormTitle')} />

        {error ? <p className="text-sm font-semibold text-clay">{error}</p> : null}

        <div className="flex justify-between gap-3 pb-8">
          <Btn variant="ghost" className="bg-white" type="button" onClick={onBack}>
            {t('staffCreate.back')}
          </Btn>
          <Btn type="submit" disabled={saving}>
            {saving ? t('staffCreate.savingAll') : t('staffCreate.saveAll')}
          </Btn>
        </div>
      </form>
    </div>
  )
}
