import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2, Upload } from 'lucide-react'
import { useStore } from '../store'
import type { Application, Applicant, DocType, Status } from '../types'
import {
  DOC_TYPES,
  STATUSES,
  emptyApplicant,
  formatDateTime,
  money,
  nowIso,
  requiredDocsOk,
  staffBase,
  statusLabel,
  uid,
} from '../types'
import { ApplicantFields, CATEGORIES, CITIES_BY_COUNTRY, SUBMIT_COUNTRIES } from '../visaForm'
import { Avatar, Btn, Card, Empty, Field, StatusBadge } from '../ui'
import { PortalAutofillEvidenceSection } from './PortalAutofillEvidenceSection'

export function ApplicationDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { apps, upsert, remove, addDoc, openDoc, session, settings, users } = useStore()
  const found = apps.find((a) => a.id === id)
  const [form, setForm] = useState<Application | null>(found ?? null)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [uploading, setUploading] = useState<DocType | null>(null)
  const [docError, setDocError] = useState('')

  useEffect(() => {
    if (!found) {
      setForm(null)
      return
    }
    // DEC-008: keep dirty local edits; sync store-owned status/timeline/documents after side effects.
    setForm((prev) => {
      if (!prev || prev.id !== found.id) return found
      return {
        ...prev,
        status: found.status,
        timeline: found.timeline,
        documents: found.documents,
        updatedAt: found.updatedAt,
      }
    })
  }, [found])

  if (!form) {
    return <Empty title="Нет такой заявки" text="Вернитесь к списку." />
  }

  const person = form.applicants[0]
  const name = person ? `${person.firstName} ${person.lastName}` : form.code

  function patch(p: Partial<Application>) {
    setForm({ ...form!, ...p, updatedAt: nowIso() })
    setSaved(false)
  }

  async function save() {
    setSaveError('')
    const live = apps.find((a) => a.id === form!.id) ?? form!
    const next = {
      ...form!,
      documents: live.documents,
      timeline:
        found && found.status !== form!.status
          ? [
              ...live.timeline,
              {
                at: nowIso(),
                text: `Статус: ${statusLabel(form!.status)}`,
                actor: session?.name ?? 'Агент',
              },
            ]
          : live.timeline,
    }
    try {
      await upsert(next)
      setForm(next)
      setSaved(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Не удалось сохранить заявку')
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to={`${staffBase(session?.role)}/apps`} className="inline-flex items-center gap-1 text-sm font-semibold text-muted">
          <ArrowLeft size={14} /> К списку
        </Link>
        <div className="flex gap-2">
          <Btn onClick={() => void save()}>{saved ? 'Сохранено' : 'Сохранить'}</Btn>
          <Btn
            variant="danger"
            onClick={() => {
              void remove(form.id).then(() => nav(`${staffBase(session?.role)}/apps`))
            }}
          >
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
          <StatusBadge status={form.status} />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <p className="mb-4 font-bold">Поездка и подача</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Категория">
              <select
                className="field"
                value={form.category || 'Normal'}
                onChange={(e) => patch({ category: e.target.value })}
              >
                {CATEGORIES.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Направление">
              <select className="field" value={form.destination} onChange={(e) => patch({ destination: e.target.value })}>
                {[...new Set([form.destination, ...settings.destinations].filter(Boolean))].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Страна подачи">
              <select
                className="field"
                value={form.submitCountry}
                onChange={(e) => {
                  const country = e.target.value
                  const nextCities = CITIES_BY_COUNTRY[country]
                  patch({
                    submitCountry: country,
                    submitCity: nextCities?.includes(form.submitCity) ? form.submitCity : nextCities?.[0] || form.submitCity,
                  })
                }}
              >
                {[...new Set([form.submitCountry, ...SUBMIT_COUNTRIES].filter(Boolean))].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Город подачи">
              <select className="field" value={form.submitCity} onChange={(e) => patch({ submitCity: e.target.value })}>
                {[
                  ...new Set(
                    [form.submitCity, ...(CITIES_BY_COUNTRY[form.submitCountry] ?? []), ...settings.cities].filter(Boolean),
                  ),
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Подача от">
              <input type="date" className="field" value={form.submitFrom || ''} onChange={(e) => patch({ submitFrom: e.target.value })} />
            </Field>
            <Field label="Подача до">
              <input type="date" className="field" value={form.submitTo || ''} onChange={(e) => patch({ submitTo: e.target.value })} />
            </Field>
            <Field label="Агент">
              <select className="field" value={form.manager} onChange={(e) => patch({ manager: e.target.value })}>
                {[...new Set([form.manager, ...users.filter((u) => u.role === 'manager' && u.active).map((u) => u.name)].filter(Boolean))].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Въезд в Шенген">
              <input type="date" className="field" value={form.travelDate} onChange={(e) => patch({ travelDate: e.target.value })} />
            </Field>
            <div className="sm:col-span-2 flex flex-wrap gap-5">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={Boolean(form.paused)}
                  onChange={(e) => patch({ paused: e.target.checked })}
                />
                На паузе
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={Boolean(form.transfer)}
                  onChange={(e) => patch({ transfer: e.target.checked })}
                />
                Трансфер
              </label>
            </div>
            <div className="sm:col-span-2">
              <Field label="Комментарий">
                <textarea className="field min-h-[80px]" value={form.comment} onChange={(e) => patch({ comment: e.target.value })} />
              </Field>
            </div>
          </div>
        </Card>

        <Card>
          <p className="mb-4 font-bold">Статус и визит</p>
          <Field label="Статус">
            <select
              className="field"
              value={form.status}
              onChange={(e) => patch({ status: e.target.value as Status })}
            >
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
              <input type="date" className="field" value={form.visitDate} onChange={(e) => patch({ visitDate: e.target.value })} />
            </Field>
            <Field label="Время">
              <input type="time" className="field" value={form.visitTime} onChange={(e) => patch({ visitTime: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Куда приходить">
                <input className="field" value={form.visitPlace} onChange={(e) => patch({ visitPlace: e.target.value })} />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <p className="mb-4 font-bold">Заявители</p>
          <div className="space-y-6">
            {form.applicants.map((person, index) => (
              <div key={person.id} className={index ? 'border-t border-line pt-6' : ''}>
                <p className="mb-3 text-sm font-bold">
                  {person.firstName || person.lastName
                    ? `${person.firstName} ${person.lastName}`
                    : `Заявитель ${index + 1}`}
                </p>
                <ApplicantFields
                  person={person}
                  onChange={(next) => {
                    const applicants = form.applicants.map((a, i) =>
                      i === index ? ({ ...emptyApplicant(), ...a, ...next } as Applicant) : a,
                    )
                    patch({ applicants })
                  }}
                />
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
                value={form.paymentAmount}
                onChange={(e) => patch({ paymentAmount: Number(e.target.value) })}
              />
            </Field>
            <Field label="Статус оплаты">
              <select
                className="field"
                value={form.paymentPaid ? '1' : '0'}
                onChange={(e) => patch({ paymentPaid: e.target.value === '1' })}
              >
                <option value="0">Не оплачено</option>
                <option value="1">Оплачено</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Заметка">
                <input className="field" value={form.paymentNote} onChange={(e) => patch({ paymentNote: e.target.value })} />
              </Field>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">К оплате: {money(form.paymentAmount)}</p>
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
                          onClick={() => void openDoc(form.id, latest.id)}
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
                        setDocError('')
                        setUploading(d.id)
                        void addDoc(
                          form.id,
                          {
                            id: uid('doc'),
                            type: d.id,
                            name: file.name,
                            uploadedAt: nowIso(),
                          },
                          file,
                        )
                          .catch((err: unknown) =>
                            setDocError(err instanceof Error ? err.message : 'Не удалось загрузить'),
                          )
                          .finally(() => {
                            setUploading(null)
                            e.target.value = ''
                          })
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
