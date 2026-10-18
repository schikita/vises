import type { FormEvent } from 'react'
import type {
  FieldArrayWithId,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Copy, Link2, Plus, Trash2 } from 'lucide-react'
import type { IssuedAccess } from '@/entities/user'
import type { Application } from '@/entities/application'
import { inviteUrl } from '@/entities/session'
import {
  ApplicantFields,
  CATEGORIES,
  CITIES_BY_COUNTRY,
  getNestedFormError,
  SUBMIT_COUNTRIES,
} from '@/features/application-form'
import { Btn, Card, Field } from '@/shared/ui'
import { STAFF_ANKETA_TABS, STAFF_CREATE_STEP_KEYS } from './constants'
import type { StaffAnketaTab } from './types'

type StaffCreateApplicationRenderProps = {
  step: number
  anketaTab: StaffAnketaTab
  cities: string[]
  saving: boolean
  error: string
  issued: IssuedAccess | null
  createdAppId: string | null
  copied: boolean
  staffAppsBase: string
  register: UseFormRegister<Application>
  setValue: UseFormSetValue<Application>
  watch: UseFormWatch<Application>
  errors: FieldErrors<Application>
  applicantFields: FieldArrayWithId<Application, 'applicants', 'fieldKey'>[]
  onAnketaTabChange: (tab: StaffAnketaTab) => void
  onAddApplicant: () => void
  onRemoveApplicant: (index: number) => void
  onSubmit: (e: FormEvent) => void
  onBack: () => void
  onCopyLink: (token: string) => void
  onCopyAll: () => void
  onGoToCreatedApp: () => void
}

export const StaffCreateApplicationRender = ({
  step,
  anketaTab,
  cities,
  saving,
  error,
  issued,
  createdAppId,
  copied,
  staffAppsBase,
  register,
  setValue,
  watch,
  errors,
  applicantFields,
  onAnketaTabChange,
  onAddApplicant,
  onRemoveApplicant,
  onSubmit,
  onBack,
  onCopyLink,
  onCopyAll,
  onGoToCreatedApp,
}: StaffCreateApplicationRenderProps) => {
  const { t } = useTranslation()

  if (issued && createdAppId) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link
          to={staffAppsBase}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted"
        >
          <ArrowLeft size={14} /> {t('staffCreate.backToApps')}
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight">{t('staffCreate.createdTitle')}</h1>
        <p className="mt-1 text-sm text-muted">{t('staffCreate.createdSubtitle')}</p>
        {error && <p className="mt-4 text-sm font-semibold text-clay">{error}</p>}
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

  const err = (path: string) => getNestedFormError(errors, path)
  const paused = watch('paused')
  const transfer = watch('transfer')

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={staffAppsBase}
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted"
      >
        <ArrowLeft size={14} /> {t('staffCreate.backToApps')}
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">{t('staffCreate.title')}</h1>
      <p className="mt-1 text-sm text-muted">{t('staffCreate.subtitle')}</p>

      <div className="mt-6 flex gap-2">
        {STAFF_CREATE_STEP_KEYS.map((key, i) => (
          <div key={key} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-leaf' : 'bg-line'}`} />
            <p className={`mt-2 text-xs font-bold ${i === step ? 'text-ink' : 'text-muted'}`}>
              {t(`staffCreate.steps.${key}`)}
            </p>
          </div>
        ))}
      </div>

      <form className="mt-6" onSubmit={onSubmit}>
        {step === 0 && (
          <Card>
            <p className="mb-4 font-bold">{t('staffCreate.submissionCardTitle')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label={t('staffCreate.fields.category')} required error={err('category')}>
                  <select className="field" {...register('category')}>
                    {CATEGORIES.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field
                label={t('staffCreate.fields.submitCountry')}
                required
                error={err('submitCountry')}
              >
                <select
                  className="field"
                  {...register('submitCountry', {
                    onChange: (e) => {
                      const country = e.target.value
                      const nextCities = CITIES_BY_COUNTRY[country] ?? []
                      setValue('submitCountry', country, { shouldDirty: true })
                      setValue('submitCity', nextCities[0] ?? '', { shouldDirty: true })
                    },
                  })}
                >
                  {SUBMIT_COUNTRIES.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label={t('staffCreate.fields.submitCity')} required error={err('submitCity')}>
                <select className="field" {...register('submitCity')}>
                  {cities.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field
                label={t('staffCreate.fields.submitFrom')}
                required
                error={err('submitFrom')}
              >
                <input type="date" className="field" {...register('submitFrom')} />
              </Field>
              <Field label={t('staffCreate.fields.submitTo')} required error={err('submitTo')}>
                <input type="date" className="field" {...register('submitTo')} />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  label={t('staffCreate.fields.travelDate')}
                  required
                  error={err('travelDate')}
                >
                  <input type="date" className="field" {...register('travelDate')} />
                </Field>
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-5">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={Boolean(paused)}
                    onChange={(e) => setValue('paused', e.target.checked, { shouldDirty: true })}
                  />
                  {t('staffCreate.fields.paused')}
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={Boolean(transfer)}
                    onChange={(e) => setValue('transfer', e.target.checked, { shouldDirty: true })}
                  />
                  {t('staffCreate.fields.transfer')}
                </label>
              </div>
              <div className="sm:col-span-2">
                <Field label={t('staffCreate.fields.comment')}>
                  <textarea
                    className="field min-h-[88px]"
                    placeholder={t('staffCreate.fields.commentPlaceholder')}
                    {...register('comment')}
                  />
                </Field>
              </div>
            </div>
          </Card>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Card>
              <Field
                label={t('staffCreate.fields.clientEmail')}
                required
                error={err('clientEmail')}
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

            <div className="flex flex-wrap gap-2">
              {STAFF_ANKETA_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    anketaTab === tab
                      ? 'bg-leaf text-white'
                      : 'bg-white text-muted ring-1 ring-line'
                  }`}
                  onClick={() => onAnketaTabChange(tab)}
                >
                  {t(`staffCreate.tabs.${tab}`)}
                </button>
              ))}
            </div>

            {applicantFields.map((field, index) => (
              <Card key={field.fieldKey}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="font-bold">
                    {t('staffCreate.applicantCardTitle', { index: index + 1 })}
                  </p>
                  {applicantFields.length > 1 && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-sm font-bold text-clay"
                      onClick={() => onRemoveApplicant(index)}
                    >
                      <Trash2 size={14} />
                      {t('staffCreate.removeApplicant')}
                    </button>
                  )}
                </div>
                <ApplicantFields namePrefix={`applicants.${index}`} section={anketaTab} />
              </Card>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-bold text-leaf"
              onClick={onAddApplicant}
            >
              <Plus size={16} />
              {t('staffCreate.addApplicant')}
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-sm font-semibold text-clay">{error}</p>}

        <div className="mt-4 flex justify-between">
          <Btn variant="ghost" className="bg-white" onClick={onBack}>
            {t('staffCreate.back')}
          </Btn>
          <Btn type="submit" disabled={saving}>
            {step === 0
              ? t('staffCreate.continue')
              : saving
                ? t('staffCreate.creating')
                : t('staffCreate.create')}
          </Btn>
        </div>
      </form>
    </div>
  )
}
