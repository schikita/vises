import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import type { Applicant } from '../types'
import { emptyApplication, nowIso } from '../types'
import { Btn, Card, Field } from '../ui'
import { PASSPORT_TYPES } from '../visaForm'

const steps = ['Поездка', 'Паспорт', 'Готово']

export function NewApplication() {
  const { session, upsert, settings } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState(() => {
    const app = emptyApplication(session?.email || session?.login || '')
    app.paymentAmount = settings.defaultPrice
    if (settings.destinations[0]) app.destination = settings.destinations[0]
    if (settings.cities[0]) app.submitCity = settings.cities[0]
    return app
  })

  const p = draft.applicants[0]
  const canTrip = draft.travelDate && draft.returnDate
  const canPerson =
    p.firstName &&
    p.lastName &&
    p.lastNameAtBirth &&
    p.dob &&
    p.passportNumber &&
    p.passportType &&
    p.passportIssuedBy &&
    p.phone

  const title = useMemo(() => steps[step], [step])

  function setApplicant(patch: Partial<Applicant>) {
    setDraft({
      ...draft,
      applicants: [{ ...p, ...patch }],
    })
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const next = {
      ...draft,
      status: 'docs' as const,
      updatedAt: nowIso(),
      timeline: [
        { at: nowIso(), text: 'Анкета отправлена, жду документы', actor: session?.name ?? 'Клиент' },
      ],
    }
    try {
      const saved = await upsert(next)
      setDraft(saved)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить анкету')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Новая заявка</h1>
      <p className="mt-1 text-sm text-muted">Три шага. Паспорт — латиницей, как в загранпаспорте.</p>

      <div className="mt-6 flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-leaf' : 'bg-line'}`} />
            <p className={`mt-2 text-xs font-bold ${i === step ? 'text-ink' : 'text-muted'}`}>{s}</p>
          </div>
        ))}
      </div>

      {step < 2 && (
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault()
            if (step === 0 && canTrip) setStep(1)
            else if (step === 1 && canPerson) submit(e)
          }}
        >
          <Card>
            <p className="mb-4 text-sm font-bold">{title}</p>
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Куда виза">
                  <select
                    className="field"
                    value={draft.destination}
                    onChange={(e) => setDraft({ ...draft, destination: e.target.value })}
                  >
                    {settings.destinations.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Тип визы">
                  <select
                    className="field"
                    value={draft.visaType}
                    onChange={(e) => setDraft({ ...draft, visaType: e.target.value })}
                  >
                    {['Туристическая', 'Гостевая', 'Деловая'].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Страна подачи">
                  <select
                    className="field"
                    value={draft.submitCountry}
                    onChange={(e) => setDraft({ ...draft, submitCountry: e.target.value })}
                  >
                    {['Беларусь', 'Россия'].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Город подачи">
                  <select
                    className="field"
                    value={draft.submitCity}
                    onChange={(e) => setDraft({ ...draft, submitCity: e.target.value })}
                  >
                    {settings.cities.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Дата въезда">
                  <input
                    type="date"
                    className="field"
                    value={draft.travelDate}
                    onChange={(e) => setDraft({ ...draft, travelDate: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Дата выезда">
                  <input
                    type="date"
                    className="field"
                    value={draft.returnDate}
                    onChange={(e) => setDraft({ ...draft, returnDate: e.target.value })}
                    required
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Комментарий агенту">
                    <textarea
                      className="field min-h-[88px]"
                      value={draft.comment}
                      onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
                      placeholder="Например, удобные дни для визита"
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Имя (латиницей)">
                  <input
                    className="field uppercase"
                    value={p.firstName}
                    onChange={(e) => setApplicant({ firstName: e.target.value.toUpperCase() })}
                    required
                  />
                </Field>
                <Field label="Фамилия">
                  <input
                    className="field uppercase"
                    value={p.lastName}
                    onChange={(e) => setApplicant({ lastName: e.target.value.toUpperCase() })}
                    required
                  />
                </Field>
                <Field label="Фамилия при рождении" required>
                  <input
                    className="field uppercase"
                    value={p.lastNameAtBirth}
                    onChange={(e) => setApplicant({ lastNameAtBirth: e.target.value.toUpperCase() })}
                    required
                  />
                </Field>
                <Field label="Дата рождения">
                  <input
                    type="date"
                    className="field"
                    value={p.dob}
                    onChange={(e) => setApplicant({ dob: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Место рождения">
                  <input
                    className="field uppercase"
                    value={p.placeOfBirth}
                    onChange={(e) => setApplicant({ placeOfBirth: e.target.value.toUpperCase() })}
                  />
                </Field>
                <Field label="Гражданство">
                  <input
                    className="field"
                    value={p.nationality}
                    onChange={(e) => setApplicant({ nationality: e.target.value })}
                  />
                </Field>
                <Field label="Пол">
                  <select
                    className="field"
                    value={p.gender}
                    onChange={(e) =>
                      setApplicant({ gender: e.target.value as Applicant['gender'] })
                    }
                  >
                    <option value="female">Женский</option>
                    <option value="male">Мужской</option>
                  </select>
                </Field>
                <Field label="Семейное положение">
                  <select
                    className="field"
                    value={p.maritalStatus}
                    onChange={(e) => setApplicant({ maritalStatus: e.target.value })}
                  >
                    {['Single', 'Married', 'Divorced', 'Widowed'].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Тип паспорта" required>
                  <select
                    className="field"
                    value={p.passportType || 'Ordinary passport'}
                    onChange={(e) => setApplicant({ passportType: e.target.value })}
                    required
                  >
                    {PASSPORT_TYPES.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Номер паспорта">
                  <input
                    className="field uppercase"
                    value={p.passportNumber}
                    onChange={(e) => setApplicant({ passportNumber: e.target.value.toUpperCase() })}
                    required
                  />
                </Field>
                <Field label="Паспорт выдан">
                  <input
                    type="date"
                    className="field"
                    value={p.passportIssued}
                    onChange={(e) => setApplicant({ passportIssued: e.target.value })}
                  />
                </Field>
                <Field label="Паспорт до">
                  <input
                    type="date"
                    className="field"
                    value={p.passportExpires}
                    onChange={(e) => setApplicant({ passportExpires: e.target.value })}
                  />
                </Field>
                <Field label="Кем выдан" required>
                  <input
                    className="field uppercase"
                    value={p.passportIssuedBy || ''}
                    onChange={(e) =>
                      setApplicant({ passportIssuedBy: e.target.value.toUpperCase() })
                    }
                    placeholder="RUEP MINSK"
                    required
                  />
                </Field>
                <Field label="Телефон" required>
                  <input
                    className="field"
                    value={p.phone || ''}
                    onChange={(e) => setApplicant({ phone: e.target.value })}
                    placeholder="291234567"
                    inputMode="numeric"
                    required
                  />
                </Field>
                <p className="sm:col-span-2 text-xs text-muted">
                  Телефон — 9 цифр без кода страны (+375), как для портала.
                </p>
              </div>
            )}
          </Card>

          <div className="mt-4 flex justify-between">
            <Btn variant="ghost" className="bg-white" onClick={() => (step === 0 ? nav('/app') : setStep(0))}>
              Назад
            </Btn>
            <Btn type="submit">{step === 0 ? 'Дальше' : 'Отправить анкету'}</Btn>
          </div>
          {error && <p className="mt-4 text-sm font-semibold text-clay">{error}</p>}
        </form>
      )}

      {step === 2 && (
        <Card className="mt-6">
          <p className="text-lg font-extrabold">Анкета принята</p>
          <p className="mt-2 text-sm text-muted">
            Номер {draft.code}. Теперь загрузите файлы в заявке: селфи, паспорт и фото на визу.
          </p>
          <div className="mt-5">
            <Btn to={`/app/${draft.id}`}>Открыть заявку</Btn>
          </div>
        </Card>
      )}
    </div>
  )
}
