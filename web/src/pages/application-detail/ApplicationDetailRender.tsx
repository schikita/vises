import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ArrowLeft, Trash2, Upload } from 'lucide-react'
import type { Application, DocType } from '@/entities/application'
import {
  DOC_TYPES,
  STATUSES,
  money,
  requiredDocsOk,
  statusLabel,
} from '@/entities/application'
import {
  ApplicantFields,
  CATEGORIES,
  CITIES_BY_COUNTRY,
  SUBMIT_COUNTRIES,
} from '@/features/application-form'
import { Avatar, Btn, Card, Empty, Field, StatusBadge } from '@/shared/ui'
import { PortalAutofillEvidenceSection } from '@/widgets/portal-autofill-evidence'
import { formatDateTime } from '@/shared/lib'

type ApplicationDetailRenderProps = {
  form: Application | null
  found: Application | null
  saved: boolean
  saveError: string
  uploading: DocType | null
  docError: string
  destinations: string[]
  cities: string[]
  managerNames: string[]
  appsListPath: string
  register: UseFormRegister<Application>
  setValue: UseFormSetValue<Application>
  watch: UseFormWatch<Application>
  onSave: () => void
  onRemove: () => void
  onUpload: (type: DocType, file: File) => void
  onOpenDoc: (docId: string) => void
}

export const ApplicationDetailRender = ({
  form,
  found,
  saved,
  saveError,
  uploading,
  docError,
  destinations,
  cities,
  managerNames,
  appsListPath,
  register,
  setValue,
  watch,
  onSave,
  onRemove,
  onUpload,
  onOpenDoc,
}: ApplicationDetailRenderProps) => {
  if (!form) {
    return <Empty title="Нет такой заявки" text="Вернитесь к списку." />
  }

  const person = form.applicants[0]
  const name = person ? `${person.firstName} ${person.lastName}` : form.code
  const paused = watch('paused')
  const transfer = watch('transfer')
  const paymentPaid = watch('paymentPaid')
  const paymentAmount = watch('paymentAmount')
  const submitCountry = watch('submitCountry')
  const submitCity = watch('submitCity')

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={appsListPath}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted"
        >
          <ArrowLeft size={14} /> К списку
        </Link>
        <div className="flex gap-2">
          <Btn onClick={onSave}>{saved ? 'Сохранено' : 'Сохранить'}</Btn>
          <Btn variant="danger" onClick={onRemove}>
            <Trash2 size={14} />
            Удалить
          </Btn>
        </div>
      </div>
      {saveError && <p className="mb-4 text-sm font-semibold text-clay">{saveError}</p>}

      <Card className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar name={name} size={52} />
            <div>
              <h1 className="text-xl font-extrabold">{name}</h1>
              <p className="mt-1 text-sm text-muted">
                {form.code} · {form.destination} · {form.visaType}
              </p>
            </div>
          </div>
          <StatusBadge status={form.status} label={statusLabel(form.status)} />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <p className="mb-4 font-bold">Поездка и подача</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Категория">
              <select className="field" {...register('category')}>
                {CATEGORIES.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Направление">
              <select className="field" {...register('destination')}>
                {[...new Set([form.destination, ...destinations].filter(Boolean))].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Страна подачи">
              <select
                className="field"
                {...register('submitCountry', {
                  onChange: (e) => {
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
                {[...new Set([form.submitCountry, ...SUBMIT_COUNTRIES].filter(Boolean))].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Город подачи">
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
            <Field label="Подача от">
              <input type="date" className="field" {...register('submitFrom')} />
            </Field>
            <Field label="Подача до">
              <input type="date" className="field" {...register('submitTo')} />
            </Field>
            <Field label="Агент">
              <select className="field" {...register('manager')}>
                {[...new Set([form.manager, ...managerNames].filter(Boolean))].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Въезд в Шенген">
              <input type="date" className="field" {...register('travelDate')} />
            </Field>
            <div className="sm:col-span-2 flex flex-wrap gap-5">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={Boolean(paused)}
                  onChange={(e) => {
                    setValue('paused', e.target.checked, { shouldDirty: true })
                  }}
                />
                На паузе
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={Boolean(transfer)}
                  onChange={(e) => {
                    setValue('transfer', e.target.checked, { shouldDirty: true })
                  }}
                />
                Трансфер
              </label>
            </div>
            <div className="sm:col-span-2">
              <Field label="Комментарий">
                <textarea className="field min-h-[80px]" {...register('comment')} />
              </Field>
            </div>
          </div>
        </Card>

        <Card>
          <p className="mb-4 font-bold">Статус и визит</p>
          <Field label="Статус">
            <select className="field" {...register('status')}>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <p className="mt-2 text-xs text-muted">{STATUSES.find((s) => s.id === form.status)?.hint}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Дата визита">
              <input type="date" className="field" {...register('visitDate')} />
            </Field>
            <Field label="Время">
              <input type="time" className="field" {...register('visitTime')} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Куда приходить">
                <input className="field" {...register('visitPlace')} />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <p className="mb-4 font-bold">Заявители</p>
          <div className="space-y-6">
            {form.applicants.map((applicant, index) => (
              <div key={applicant.id} className={index ? 'border-t border-line pt-6' : ''}>
                <p className="mb-3 text-sm font-bold">
                  {applicant.firstName || applicant.lastName
                    ? `${applicant.firstName} ${applicant.lastName}`
                    : `Заявитель ${index + 1}`}
                </p>
                <ApplicantFields namePrefix={`applicants.${index}`} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-4 font-bold">Оплата</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Сумма, ₽">
              <input
                type="number"
                className="field"
                {...register('paymentAmount', { valueAsNumber: true })}
              />
            </Field>
            <Field label="Статус оплаты">
              <select
                className="field"
                value={paymentPaid ? '1' : '0'}
                onChange={(e) => {
                  setValue('paymentPaid', e.target.value === '1', { shouldDirty: true })
                }}
              >
                <option value="0">Не оплачено</option>
                <option value="1">Оплачено</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Заметка">
                <input className="field" {...register('paymentNote')} />
              </Field>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">К оплате: {money(paymentAmount)}</p>
        </Card>

        <Card>
          <p className="mb-1 font-bold">Документы</p>
          <p className="mb-4 text-sm text-muted">
            Селфи без фильтров, светлый фон. Фото на визу — до 200 КБ.
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
                      {d.label}
                      {d.required ? ' *' : ''}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {files.length
                        ? files.map((f) => f.name).join(', ')
                        : uploading === d.id
                          ? 'загружаем…'
                          : 'ещё не загружено'}
                    </p>
                    {files.length > 0 &&
                      (canOpen ? (
                        <button
                          type="button"
                          className="mt-1 text-xs font-bold text-leaf"
                          onClick={() => onOpenDoc(latest.id)}
                        >
                          Открыть
                        </button>
                      ) : (
                        <p className="mt-1 text-xs font-semibold text-muted">Файл недоступен</p>
                      ))}
                  </div>
                  <label className="flex shrink-0 cursor-pointer items-center gap-1 text-sm font-bold text-leaf">
                    <Upload size={14} />
                    {files.length ? 'Заменить' : 'Файл'}
                    <input
                      type="file"
                      accept={d.id === 'video' ? 'video/mp4,.mp4,.mov' : 'image/*,.pdf'}
                      className="hidden"
                      onChange={(e) => {
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
          {docError && <p className="mt-3 text-sm font-semibold text-clay">{docError}</p>}
          {requiredDocsOk(form) && (
            <p className="mt-3 text-sm font-semibold text-leaf">Обязательные файлы на месте.</p>
          )}
        </Card>

        <PortalAutofillEvidenceSection
          applicationId={form.id}
          applicants={form.applicants}
          persistedApplicantIds={(found?.applicants ?? []).map((a) => a.id).filter(Boolean)}
          clientEmail={form.clientEmail}
        />

        <Card>
          <p className="mb-4 font-bold">История</p>
          <ol className="space-y-3">
            {[...form.timeline].reverse().map((item) => (
              <li key={item.at + item.text} className="text-sm">
                <p className="font-semibold">{item.text}</p>
                <p className="text-xs text-muted">
                  {item.actor} · {formatDateTime(item.at)}
                </p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  )
}
