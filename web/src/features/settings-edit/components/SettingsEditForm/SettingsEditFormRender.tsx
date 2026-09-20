import type { FormEvent } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Btn, Field } from '@/shared/ui'
import type { SettingsEditFormValues } from '../../types'

type SettingsEditFormRenderProps = {
  saved: boolean
  lockedCitiesLabel: string
  register: UseFormRegister<SettingsEditFormValues>
  errors: FieldErrors<SettingsEditFormValues>
  onSubmit: (e: FormEvent) => void
}

export const SettingsEditFormRender = ({
  saved,
  lockedCitiesLabel,
  register,
  errors,
  onSubmit,
}: SettingsEditFormRenderProps) => (
  <form
    className="space-y-4"
    onSubmit={onSubmit}
  >
    <Field label="Название" error={errors.company?.message}>
      <input className="field" {...register('company')} />
    </Field>
    <Field label="Цена заявки по умолчанию, ₽" error={errors.price?.message}>
      <input className="field" type="number" {...register('price')} />
    </Field>
    <Field label="Города подачи">
      <input
        className="field bg-[#f7f4ee] text-muted"
        value={lockedCitiesLabel}
        readOnly
        tabIndex={-1}
        aria-readonly="true"
      />
      <p className="mt-1 text-xs text-muted">
        Город подачи зафиксирован: только Минск. Москва и другие города недоступны.
      </p>
    </Field>
    <Field label="Направления" error={errors.destinations?.message}>
      <input className="field" {...register('destinations')} />
    </Field>
    <Field label="ID плана Webshare (необязательно)" error={errors.websharePlanId?.message}>
      <input
        className="field"
        maxLength={120}
        placeholder="Пусто = план по умолчанию в Webshare"
        {...register('websharePlanId')}
      />
    </Field>
    <p className="text-xs text-muted">
      Прокси Webshare и Mail.tm OTP включаются автоматически при наличии ключей
      в окружении сервера (WEBSHARE_API_KEY / MAILTM_API_BASE_URL). Переключатели
      на этом экране убраны.
    </p>
    <Btn type="submit">{saved ? 'Сохранено' : 'Сохранить'}</Btn>
  </form>
)
