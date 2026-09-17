import type { FormEvent } from 'react'
import type {
  FieldArrayWithId,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ArrowLeft, Copy, Link2, Plus, Trash2, Upload } from 'lucide-react'
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
import { STAFF_CREATE_STEPS } from './constants'

type StaffCreateApplicationRenderProps = {
  step: number
  cities: string[]
  video: File | null
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
  onAddApplicant: () => void
  onRemoveApplicant: (index: number) => void
  onVideoChange: (file: File | null) => void
  onSubmit: (e: FormEvent) => void
  onBack: () => void
  onCopyLink: (token: string) => void
  onCopyAll: () => void
  onGoToCreatedApp: () => void
}

export const StaffCreateApplicationRender = ({
  step,
  cities,
  video,
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
  onAddApplicant,
  onRemoveApplicant,
  onVideoChange,
  onSubmit,
  onBack,
  onCopyLink,
  onCopyAll,
  onGoToCreatedApp,
}: StaffCreateApplicationRenderProps) => {
  if (issued && createdAppId) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link
          to={staffAppsBase}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted"
        >
          <ArrowLeft size={14} /> К заявкам
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Заявка создана</h1>
        <p className="mt-1 text-sm text-muted">Отправьте клиенту логин, пароль и ссылку для входа.</p>
        {error && <p className="mt-4 text-sm font-semibold text-clay">{error}</p>}
        <Card className="mt-6 border-leaf/40 bg-[#f3f8f5]">
          <p className="font-bold">Доступ для {issued.user.name}</p>
          <p className="mt-2 text-sm">
            Логин: <b>{issued.user.login}</b>
          </p>
          <p className="text-sm">
            Пароль: <b>{issued.password}</b>
          </p>
          <p className="mt-2 break-all text-xs text-muted">{inviteUrl(issued.token)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn onClick={() => onCopyLink(issued.token)}>
              <Link2 size={14} />
              {copied ? 'Скопировано' : 'Копировать ссылку'}
            </Btn>
            <Btn variant="ghost" className="bg-white" onClick={onCopyAll}>
              <Copy size={14} />
              Копировать всё
            </Btn>
          </div>
        </Card>
        <div className="mt-4 flex justify-end">
          <Btn onClick={onGoToCreatedApp}>Перейти к заявке</Btn>
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
        <ArrowLeft size={14} /> К заявкам
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Создать заявку</h1>
      <p className="mt-1 text-sm text-muted">
        Данные как в анкете визового центра: латиницей, как в загранпаспорте.
      </p>

      <div className="mt-6 flex gap-2">
        {STAFF_CREATE_STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-leaf' : 'bg-line'}`} />
            <p className={`mt-2 text-xs font-bold ${i === step ? 'text-ink' : 'text-muted'}`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <form className="mt-6" onSubmit={onSubmit}>
        {step === 0 && (
          <Card>
            <p className="mb-4 font-bold">Параметры подачи</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Категория" required error={err('category')}>
                  <select className="field" {...register('category')}>
                    {CATEGORIES.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Страна подачи" required error={err('submitCountry')}>
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
              <Field label="Город подачи" required error={err('submitCity')}>
                <select className="field" {...register('submitCity')}>
                  {cities.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Подача клиента от" required error={err('submitFrom')}>
                <input type="date" className="field" {...register('submitFrom')} />
              </Field>
              <Field label="Подача клиента до" required error={err('submitTo')}>
                <input type="date" className="field" {...register('submitTo')} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Дата въезда в Шенген" required error={err('travelDate')}>
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
                  На паузе
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={Boolean(transfer)}
                    onChange={(e) => setValue('transfer', e.target.checked, { shouldDirty: true })}
                  />
                  Трансфер
                </label>
              </div>
              <div className="sm:col-span-2">
                <Field label="Комментарий">
                  <textarea
                    className="field min-h-[88px]"
                    placeholder="Комментарий к заявке..."
                    {...register('comment')}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Видео файл (.mp4)">
                  <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-white text-sm font-bold text-leaf">
                    <Upload size={16} />
                    {video ? video.name : 'Загрузить видео'}
                    <input
                      type="file"
                      accept="video/mp4,.mp4,.mov"
                      className="hidden"
                      onChange={(e) => onVideoChange(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </Field>
              </div>
            </div>
          </Card>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Card>
              <Field label="Email или логин клиента" required error={err('clientEmail')}>
                <input
                  className="field"
                  type="text"
                  placeholder="client@example.com"
                  autoComplete="off"
                  {...register('clientEmail')}
                />
              </Field>
            </Card>
            {applicantFields.map((field, index) => (
              <Card key={field.fieldKey}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="font-bold">Заявитель {index + 1}</p>
                  {applicantFields.length > 1 && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-sm font-bold text-clay"
                      onClick={() => onRemoveApplicant(index)}
                    >
                      <Trash2 size={14} />
                      Удалить
                    </button>
                  )}
                </div>
                <ApplicantFields namePrefix={`applicants.${index}`} />
              </Card>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-bold text-leaf"
              onClick={onAddApplicant}
            >
              <Plus size={16} />
              Добавить заявителя
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-sm font-semibold text-clay">{error}</p>}

        <div className="mt-4 flex justify-between">
          <Btn variant="ghost" className="bg-white" onClick={onBack}>
            Назад
          </Btn>
          <Btn type="submit" disabled={saving}>
            {step === 0 ? 'Продолжить' : saving ? 'Создаём…' : 'Создать заявку'}
          </Btn>
        </div>
      </form>
    </div>
  )
}
