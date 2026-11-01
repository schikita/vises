import { useFormContext } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Trash2, Upload } from 'lucide-react'
import type { Application } from '@/entities/application'
import {
  DOC_TYPES,
  isApplicationStatus,
  requiredDocsOk,
  statusLabel,
} from '@/entities/application'
import {
  ApplicantFields,
  CATEGORIES,
  CITIES_BY_COUNTRY,
  SUBMIT_COUNTRIES,
  getNestedFormError,
} from '@/features/application-form'
import { Avatar, Btn, Card, Empty, Field, StatusBadge } from '@/shared/ui'
import { APPLICATION_DETAIL_TAB_IDS } from './constants'
import type { ApplicationDetailRenderProps } from './types'
import {
  formatPaymentAmountDisplay,
  hasApplicationDetailApplicantErrors,
  hasApplicationDetailTabErrors,
} from './utils'

export const ApplicationDetailRender = ({
  form,
  loading,
  saved,
  saveError,
  uploading,
  docError,
  destinations,
  cities,
  managerNames,
  appsListPath,
  activeTab,
  statusChangeControls,
  historyTimeline,
  clientPassportLink,
  register,
  setValue,
  watch,
  onTabChange,
  onSave,
  onRemove,
  onUpload,
  onOpenDoc,
}: ApplicationDetailRenderProps): React.ReactElement => {
  const { t } = useTranslation()
  const {
    formState: { errors },
  } = useFormContext<Application>()

  if (loading) {
    return (
      <Empty
        title={t('applicationDetail.loadingTitle')}
        text={t('applicationDetail.loadingText')}
      />
    )
  }

  if (!form) {
    return (
      <Empty
        title={t('applicationDetail.missingTitle')}
        text={t('applicationDetail.missingText')}
      />
    )
  }

  const person = form.applicants[0]
  const name = person ? `${person.firstName} ${person.lastName}` : form.code
  const paused = watch('paused')
  const transfer = watch('transfer')
  const paymentPaid = watch('paymentPaid')
  const paymentAmount = watch('paymentAmount')
  const submitCountry = watch('submitCountry')
  const submitCity = watch('submitCity')
  const portalFormEmail = (form.portalFormEmail ?? '').trim()
  const applicantCount = form.applicants.length
  const statusBadgeLabel = isApplicationStatus(form.status)
    ? t(`applications.status.${form.status}`)
    : statusLabel(form.status)
  const paymentAmountLabel = formatPaymentAmountDisplay(paymentAmount)

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={appsListPath}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted"
        >
          <ArrowLeft size={14} /> {t('applicationDetail.backToList')}
        </Link>
        <div className="flex flex-wrap gap-2">
          {clientPassportLink}
          <Btn onClick={onSave}>
            {saved ? t('applicationDetail.saved') : t('applicationDetail.save')}
          </Btn>
          <Btn variant="danger" onClick={onRemove}>
            <Trash2 size={14} />
            {t('applicationDetail.delete')}
          </Btn>
        </div>
      </div>
      {saveError ? (
        <p className="mb-4 text-sm font-semibold text-clay">{saveError}</p>
      ) : null}

      <Card className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar name={name} size={52} />
            <div>
              <h1 className="text-xl font-extrabold">{name}</h1>
              <p className="mt-1 text-sm text-muted">
                {form.code} · {form.destination} · {form.visaType}
              </p>
              <p className="mt-2 text-sm">
                <span className="font-semibold text-muted">
                  {t('applicationDetail.fields.portalFormEmail')}:{' '}
                </span>
                <span
                  className={
                    portalFormEmail ? 'font-semibold text-ink' : 'text-muted'
                  }
                >
                  {portalFormEmail ||
                    t('applicationDetail.fields.portalFormEmailEmpty')}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted">
                {t('applicationDetail.fields.portalFormEmailHint')}
              </p>
            </div>
          </div>
          <StatusBadge status={form.status} label={statusBadgeLabel} />
        </div>
      </Card>

      <div
        className="mb-5 flex flex-wrap gap-2 border-b border-line pb-3"
        role="tablist"
        aria-label={t('applicationDetail.tabsAriaLabel')}
      >
        {APPLICATION_DETAIL_TAB_IDS.map((tabId) => {
          const selected = activeTab === tabId
          const tabHasError = hasApplicationDetailTabErrors(
            errors,
            tabId,
            applicantCount,
          )
          return (
            <button
              key={tabId}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-invalid={tabHasError || undefined}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                tabHasError
                  ? `border border-clay bg-[#fbe7e0] text-clay ${selected ? 'ring-2 ring-clay' : ''}`
                  : selected
                    ? 'bg-forest text-white'
                    : 'border border-line bg-white text-ink'
              }`}
              onClick={(): void => {
                onTabChange(tabId)
              }}
            >
              {t(`applicationDetail.tabs.${tabId}`)}
              {tabHasError
                ? ` · ${t('applicationDetail.tabErrorCue')}`
                : ''}
            </button>
          )
        })}
      </div>

      {activeTab === 'trip' ? (
        <div className="grid gap-5 lg:grid-cols-2" role="tabpanel">
          <Card>
            <p className="mb-4 font-bold">
              {t('applicationDetail.sections.trip')}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('applicationDetail.fields.category')}>
                <select className="field" {...register('category')}>
                  {CATEGORIES.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label={t('applicationDetail.fields.destination')}>
                <select className="field" {...register('destination')}>
                  {[
                    ...new Set(
                      [form.destination, ...destinations].filter(Boolean),
                    ),
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label={t('applicationDetail.fields.submitCountry')}>
                <select
                  className="field"
                  {...register('submitCountry', {
                    onChange: (e): void => {
                      const country = e.target.value
                      const nextCities = CITIES_BY_COUNTRY[country]
                      setValue('submitCountry', country, { shouldDirty: true })
                      setValue(
                        'submitCity',
                        nextCities?.includes(submitCity)
                          ? submitCity
                          : nextCities?.[0] || submitCity,
                        { shouldDirty: true },
                      )
                    },
                  })}
                >
                  {[
                    ...new Set(
                      [form.submitCountry, ...SUBMIT_COUNTRIES].filter(Boolean),
                    ),
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label={t('applicationDetail.fields.submitCity')}>
                <select className="field" {...register('submitCity')}>
                  {[
                    ...new Set(
                      [
                        form.submitCity,
                        ...(CITIES_BY_COUNTRY[submitCountry] ?? []),
                        ...cities,
                      ].filter(Boolean),
                    ),
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label={t('applicationDetail.fields.submitFrom')}>
                <input
                  type="date"
                  className="field"
                  {...register('submitFrom')}
                />
              </Field>
              <Field label={t('applicationDetail.fields.submitTo')}>
                <input type="date" className="field" {...register('submitTo')} />
              </Field>
              <Field label={t('applicationDetail.fields.manager')}>
                <select className="field" {...register('manager')}>
                  {[
                    ...new Set(
                      [form.manager, ...managerNames].filter(Boolean),
                    ),
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label={t('applicationDetail.fields.travelDate')}>
                <input
                  type="date"
                  className="field"
                  {...register('travelDate')}
                />
              </Field>
              <Field
                label={t('staffCreate.fields.clientEmail')}
                error={getNestedFormError(errors, 'clientEmail')}
              >
                <input
                  className="field"
                  type="email"
                  autoComplete="email"
                  {...register('clientEmail')}
                />
              </Field>
              <Field
                label={t('applicationDetail.fields.returnDate')}
                error={getNestedFormError(errors, 'returnDate')}
              >
                <input
                  type="date"
                  className="field"
                  {...register('returnDate')}
                />
              </Field>
              <div className="sm:col-span-2 flex flex-wrap gap-5">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={Boolean(paused)}
                    onChange={(e): void => {
                      setValue('paused', e.target.checked, {
                        shouldDirty: true,
                      })
                    }}
                  />
                  {t('applicationDetail.fields.paused')}
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={Boolean(transfer)}
                    onChange={(e): void => {
                      setValue('transfer', e.target.checked, {
                        shouldDirty: true,
                      })
                    }}
                  />
                  {t('applicationDetail.fields.transfer')}
                </label>
              </div>
              <div className="sm:col-span-2">
                <Field label={t('applicationDetail.fields.comment')}>
                  <textarea
                    className="field min-h-[80px]"
                    {...register('comment')}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <p className="mb-4 font-bold">
              {t('applications.statusChange.title')}
            </p>
            {statusChangeControls}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t('applicationDetail.fields.visitDate')}>
                <input
                  type="date"
                  className="field"
                  {...register('visitDate')}
                />
              </Field>
              <Field label={t('applicationDetail.fields.visitTime')}>
                <input
                  type="time"
                  className="field"
                  {...register('visitTime')}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t('applicationDetail.fields.visitPlace')}>
                  <input className="field" {...register('visitPlace')} />
                </Field>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === 'applicants' ? (
        <div role="tabpanel">
          <Card>
            <p className="mb-4 font-bold">
              {t('applicationDetail.sections.applicants')}
            </p>
            <div className="space-y-6">
              {form.applicants.map((applicant, index) => {
                const applicantHasError = hasApplicationDetailApplicantErrors(
                  errors,
                  index,
                )
                return (
                  <div
                    key={applicant.id}
                    className={index ? 'border-t border-line pt-6' : ''}
                  >
                    <p
                      className={`mb-3 text-sm font-bold ${
                        applicantHasError
                          ? 'border-l-4 border-clay bg-[#fbe7e0] pl-3 text-clay'
                          : ''
                      }`}
                    >
                      {applicant.firstName || applicant.lastName
                        ? `${applicant.firstName} ${applicant.lastName}`
                        : t('applicationDetail.applicantFallback', {
                            index: index + 1,
                          })}
                    </p>
                    <ApplicantFields namePrefix={`applicants.${index}`} />
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === 'payment' ? (
        <div className="grid gap-5 lg:grid-cols-2" role="tabpanel">
          <Card>
            <p className="mb-4 font-bold">
              {t('applicationDetail.sections.payment')}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('applicationDetail.fields.paymentAmount')}>
                <input
                  type="number"
                  className="field"
                  {...register('paymentAmount', { valueAsNumber: true })}
                />
              </Field>
              <Field label={t('applicationDetail.fields.paymentStatus')}>
                <select
                  className="field"
                  value={paymentPaid ? '1' : '0'}
                  onChange={(e): void => {
                    setValue('paymentPaid', e.target.value === '1', {
                      shouldDirty: true,
                    })
                  }}
                >
                  <option value="0">
                    {t('applicationDetail.fields.unpaid')}
                  </option>
                  <option value="1">
                    {t('applicationDetail.fields.paid')}
                  </option>
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label={t('applicationDetail.fields.paymentNote')}>
                  <input className="field" {...register('paymentNote')} />
                </Field>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">
              {t('applicationDetail.fields.paymentDue', {
                amount: paymentAmountLabel,
              })}
            </p>
          </Card>

          <Card>
            <p className="mb-1 font-bold">
              {t('applicationDetail.sections.documents')}
            </p>
            <p className="mb-4 text-sm text-muted">
              {t('applicationDetail.docsHint')}
            </p>
            <div className="space-y-3">
              {DOC_TYPES.map((d) => {
                const files = form.documents.filter((f) => f.type === d.id)
                const latest = files[files.length - 1]
                const canOpen = Boolean(latest?.stored)
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-line bg-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold">
                        {t(`applicationDetail.docs.${d.id}`)}
                        {d.required ? ' *' : ''}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {files.length
                          ? files.map((f) => f.name).join(', ')
                          : uploading === d.id
                            ? t('applicationDetail.docsUploading')
                            : t('applicationDetail.docsEmpty')}
                      </p>
                      {files.length > 0 &&
                        (canOpen && latest ? (
                          <button
                            type="button"
                            className="mt-1 text-xs font-bold text-leaf"
                            onClick={(): void => {
                              onOpenDoc(latest.id)
                            }}
                          >
                            {t('applicationDetail.docsOpen')}
                          </button>
                        ) : (
                          <p className="mt-1 text-xs font-semibold text-muted">
                            {t('applicationDetail.docsUnavailable')}
                          </p>
                        ))}
                    </div>
                    <label className="flex shrink-0 cursor-pointer items-center gap-1 text-sm font-bold text-leaf">
                      <Upload size={14} />
                      {files.length
                        ? t('applicationDetail.docsReplace')
                        : t('applicationDetail.docsFile')}
                      <input
                        type="file"
                        accept={
                          d.id === 'video'
                            ? 'video/mp4,.mp4,.mov'
                            : 'image/*,.pdf'
                        }
                        className="hidden"
                        onChange={(e): void => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          onUpload(d.id, file)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  </div>
                )
              })}
            </div>
            {docError ? (
              <p className="mt-3 text-sm font-semibold text-clay">{docError}</p>
            ) : null}
            {requiredDocsOk(form) ? (
              <p className="mt-3 text-sm font-semibold text-leaf">
                {t('applicationDetail.docsRequiredOk')}
              </p>
            ) : null}
          </Card>
        </div>
      ) : null}

      {activeTab === 'history' ? (
        <div role="tabpanel">
          <Card>
            <p className="mb-4 font-bold">{t('applications.history.title')}</p>
            {historyTimeline}
          </Card>
        </div>
      ) : null}
    </div>
  )
}
