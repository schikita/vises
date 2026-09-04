import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react'
import { useStore } from '../store'
import type { Applicant } from '../types'
import { emptyApplicant, emptyApplication, nowIso, staffBase } from '../types'
import { ApplicantFields, CATEGORIES, CITIES_BY_COUNTRY, SUBMIT_COUNTRIES } from '../visaForm'
import { Btn, Card, Field } from '../ui'

export function StaffCreateApplication() {
  const { session, upsert, addDoc, settings } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [video, setVideo] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState(() => {
    const app = emptyApplication('')
    app.paymentAmount = settings.defaultPrice
    app.manager = session?.name ?? ''
    app.destination = 'Испания'
    app.visaType = 'Туристическая'
    app.category = 'Normal'
    app.submitCountry = 'Belarus'
    app.submitCity = 'Minsk'
    const today = new Date().toISOString().slice(0, 10)
    app.submitFrom = today
    app.submitTo = today
    app.travelDate = today
    return app
  })

  const cities = CITIES_BY_COUNTRY[draft.submitCountry] ?? ['Minsk']

  function patch(p: Partial<typeof draft>) {
    setDraft({ ...draft, ...p })
  }

  function setApplicant(index: number, next: Partial<Applicant>) {
    setDraft({
      ...draft,
      applicants: draft.applicants.map((a, i) => (i === index ? { ...emptyApplicant(), ...a, ...next } : a)),
    })
  }

  function canTrip() {
    return Boolean(draft.category && draft.submitCountry && draft.submitCity && draft.submitFrom && draft.submitTo && draft.travelDate)
  }

  function canPeople() {
    return draft.applicants.every((p) => p.firstName && p.lastName && p.dob && p.passportNumber && p.placeOfBirth)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (step === 0) {
      if (canTrip()) setStep(1)
      return
    }
    if (!canPeople()) return
    setSaving(true)
    setError('')
    const next = {
      ...draft,
      clientEmail: draft.clientEmail.trim(),
      status: 'new' as const,
      updatedAt: nowIso(),
      timeline: [
        {
          at: nowIso(),
          text: 'Заявка создана, анкета заполнена',
          actor: session?.name ?? 'Агент',
        },
      ],
    }
    try {
      await upsert(next)
      if (video) {
        await addDoc(
          next.id,
          { id: `doc-${Date.now()}`, type: 'video', name: video.name, uploadedAt: nowIso() },
          video,
        )
      }
      nav(`${staffBase(session?.role)}/apps/${next.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать заявку')
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={`${staffBase(session?.role)}/apps`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted"
      >
        <ArrowLeft size={14} /> К заявкам
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Создать заявку</h1>
      <p className="mt-1 text-sm text-muted">
        Данные как в анкете визового центра: латиницей, как в загранпаспорте.
      </p>

      <div className="mt-6 flex gap-2">
        {['Подача', 'Анкета'].map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-leaf' : 'bg-line'}`} />
            <p className={`mt-2 text-xs font-bold ${i === step ? 'text-ink' : 'text-muted'}`}>{label}</p>
          </div>
        ))}
      </div>

      <form className="mt-6" onSubmit={submit}>
        {step === 0 && (
          <Card>
            <p className="mb-4 font-bold">Параметры подачи</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Категория" required>
                  <select className="field" value={draft.category} onChange={(e) => patch({ category: e.target.value })}>
                    {CATEGORIES.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Страна подачи" required>
                <select
                  className="field"
                  value={draft.submitCountry}
                  onChange={(e) => {
                    const country = e.target.value
                    const nextCities = CITIES_BY_COUNTRY[country] ?? []
                    patch({ submitCountry: country, submitCity: nextCities[0] ?? '' })
                  }}
                >
                  {SUBMIT_COUNTRIES.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Город подачи" required>
                <select className="field" value={draft.submitCity} onChange={(e) => patch({ submitCity: e.target.value })}>
                  {cities.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Подача клиента от" required>
                <input
                  type="date"
                  className="field"
                  value={draft.submitFrom}
                  onChange={(e) => patch({ submitFrom: e.target.value })}
                  required
                />
              </Field>
              <Field label="Подача клиента до" required>
                <input
                  type="date"
                  className="field"
                  value={draft.submitTo}
                  onChange={(e) => patch({ submitTo: e.target.value })}
                  required
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Дата въезда в Шенген" required>
                  <input
                    type="date"
                    className="field"
                    value={draft.travelDate}
                    onChange={(e) => patch({ travelDate: e.target.value })}
                    required
                  />
                </Field>
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-5">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={draft.paused} onChange={(e) => patch({ paused: e.target.checked })} />
                  На паузе
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={draft.transfer}
                    onChange={(e) => patch({ transfer: e.target.checked })}
                  />
                  Трансфер
                </label>
              </div>
              <div className="sm:col-span-2">
                <Field label="Комментарий">
                  <textarea
                    className="field min-h-[88px]"
                    value={draft.comment}
                    onChange={(e) => patch({ comment: e.target.value })}
                    placeholder="Комментарий к заявке..."
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
                      onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
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
              <Field label="Email клиента, если уже есть в системе">
                <input
                  className="field"
                  type="email"
                  value={draft.clientEmail}
                  onChange={(e) => patch({ clientEmail: e.target.value })}
                  placeholder="необязательно"
                />
              </Field>
            </Card>
            {draft.applicants.map((person, index) => (
              <Card key={person.id}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="font-bold">Заявитель {index + 1}</p>
                  {draft.applicants.length > 1 && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-sm font-bold text-clay"
                      onClick={() =>
                        patch({ applicants: draft.applicants.filter((a) => a.id !== person.id) })
                      }
                    >
                      <Trash2 size={14} />
                      Удалить
                    </button>
                  )}
                </div>
                <ApplicantFields person={person} onChange={(next) => setApplicant(index, next)} />
              </Card>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-bold text-leaf"
              onClick={() => patch({ applicants: [...draft.applicants, emptyApplicant('Spouse')] })}
            >
              <Plus size={16} />
              Добавить заявителя
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-sm font-semibold text-clay">{error}</p>}

        <div className="mt-4 flex justify-between">
          <Btn
            variant="ghost"
            className="bg-white"
            onClick={() => (step === 0 ? nav(`${staffBase(session?.role)}/apps`) : setStep(0))}
          >
            Назад
          </Btn>
          <Btn type="submit" disabled={saving || (step === 0 ? !canTrip() : !canPeople())}>
            {step === 0 ? 'Продолжить' : saving ? 'Создаём…' : 'Создать заявку'}
          </Btn>
        </div>
      </form>
    </div>
  )
}
