import type { ChangeEvent, FormEvent } from 'react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import type { Application } from '@/entities/application'
import { Btn, Card, Field } from '@/shared/ui'
import { getNestedFormError, PASSPORT_TYPES } from '@/features/application-form'
import { NEW_APPLICATION_STEPS } from './constants'

type NewApplicationRenderProps = {
  step: number
  title: string
  error: string
  destinations: string[]
  cities: string[]
  submittedId: string | null
  submittedCode: string
  register: UseFormRegister<Application>
  setValue: UseFormSetValue<Application>
  errors: FieldErrors<Application>
  watch: UseFormWatch<Application>
  onBack: () => void
  onFormSubmit: (e: FormEvent) => void
}

export const NewApplicationRender = ({
  step,
  title,
  error,
  destinations,
  cities,
  submittedId,
  submittedCode,
  register,
  setValue,
  errors,
  watch,
  onBack,
  onFormSubmit,
}: NewApplicationRenderProps) => {
  const upper = (path: 'applicants.0.firstName' | 'applicants.0.lastName' | 'applicants.0.lastNameAtBirth' | 'applicants.0.placeOfBirth' | 'applicants.0.passportNumber' | 'applicants.0.passportIssuedBy') => {
    const reg = register(path)
    return {
      ...reg,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value.toUpperCase()
        e.target.value = next
        setValue(path, next, { shouldDirty: true, shouldValidate: true })
      },
    }
  }

  const err = (path: string) => getNestedFormError(errors, path)

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Новая заявка</h1>
      <p className="mt-1 text-sm text-muted">Три шага. Паспорт — латиницей, как в загранпаспорте.</p>

      <div className="mt-6 flex gap-2">
        {NEW_APPLICATION_STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-leaf' : 'bg-line'}`} />
            <p className={`mt-2 text-xs font-bold ${i === step ? 'text-ink' : 'text-muted'}`}>{s}</p>
          </div>
        ))}
      </div>

      {step < 2 && (
        <form className="mt-6" onSubmit={onFormSubmit}>
          <Card>
            <p className="mb-4 text-sm font-bold">{title}</p>
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Куда виза">
                  <select className="field" {...register('destination')}>
                    {destinations.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Тип визы">
                  <select className="field" {...register('visaType')}>
                    {['Туристическая', 'Гостевая', 'Деловая'].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Страна подачи">
                  <select className="field" {...register('submitCountry')}>
                    {['Беларусь', 'Россия'].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Город подачи">
                  <select className="field" {...register('submitCity')}>
                    {cities.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Дата въезда" error={err('travelDate')}>
                  <input type="date" className="field" {...register('travelDate')} />
                </Field>
                <Field label="Дата выезда" error={err('returnDate')}>
                  <input type="date" className="field" {...register('returnDate')} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Комментарий агенту">
                    <textarea
                      className="field min-h-[88px]"
                      placeholder="Например, удобные дни для визита"
                      {...register('comment')}
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Имя (латиницей)" error={err('applicants.0.firstName')}>
                  <input className="field uppercase" {...upper('applicants.0.firstName')} />
                </Field>
                <Field label="Фамилия" error={err('applicants.0.lastName')}>
                  <input className="field uppercase" {...upper('applicants.0.lastName')} />
                </Field>
                <Field label="Фамилия при рождении" required error={err('applicants.0.lastNameAtBirth')}>
                  <input className="field uppercase" {...upper('applicants.0.lastNameAtBirth')} />
                </Field>
                <Field label="Дата рождения" error={err('applicants.0.dob')}>
                  <input type="date" className="field" {...register('applicants.0.dob')} />
                </Field>
                <Field label="Место рождения">
                  <input className="field uppercase" {...upper('applicants.0.placeOfBirth')} />
                </Field>
                <Field label="Гражданство">
                  <input className="field" {...register('applicants.0.nationality')} />
                </Field>
                <Field label="Пол">
                  <select className="field" {...register('applicants.0.gender')}>
                    <option value="female">Женский</option>
                    <option value="male">Мужской</option>
                  </select>
                </Field>
                <Field label="Семейное положение">
                  <select className="field" {...register('applicants.0.maritalStatus')}>
                    {['Single', 'Married', 'Divorced', 'Widowed'].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Тип паспорта" required error={err('applicants.0.passportType')}>
                  <select className="field" {...register('applicants.0.passportType')}>
                    {PASSPORT_TYPES.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Номер паспорта" error={err('applicants.0.passportNumber')}>
                  <input className="field uppercase" {...upper('applicants.0.passportNumber')} />
                </Field>
                <Field label="Паспорт выдан">
                  <input type="date" className="field" {...register('applicants.0.passportIssued')} />
                </Field>
                <Field label="Паспорт до">
                  <input type="date" className="field" {...register('applicants.0.passportExpires')} />
                </Field>
                <Field label="Кем выдан" required error={err('applicants.0.passportIssuedBy')}>
                  <input
                    className="field uppercase"
                    placeholder="RUEP MINSK"
                    {...upper('applicants.0.passportIssuedBy')}
                  />
                </Field>
                <Field label="Телефон" required error={err('applicants.0.phone')}>
                  <input
                    className="field"
                    placeholder="291234567"
                    inputMode="numeric"
                    {...register('applicants.0.phone')}
                  />
                </Field>
                <p className="sm:col-span-2 text-xs text-muted">
                  Телефон — 9 цифр без кода страны (+375), как для портала.
                </p>
              </div>
            )}
          </Card>

          <div className="mt-4 flex justify-between">
            <Btn variant="ghost" className="bg-white" onClick={onBack}>
              Назад
            </Btn>
            <Btn type="submit">{step === 0 ? 'Дальше' : 'Отправить анкету'}</Btn>
          </div>
          {error && <p className="mt-4 text-sm font-semibold text-clay">{error}</p>}
        </form>
      )}

      {step === 2 && submittedId && (
        <Card className="mt-6">
          <p className="text-lg font-extrabold">Анкета принята</p>
          <p className="mt-2 text-sm text-muted">
            Номер {submittedCode || watch('code')}. Теперь загрузите файлы в заявке: селфи, паспорт и
            фото на визу.
          </p>
          <div className="mt-5">
            <Btn to={`/app/${submittedId}`}>Открыть заявку</Btn>
          </div>
        </Card>
      )}
    </div>
  )
}
