import type { FormEvent } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Btn, Field } from '@/shared/ui'
import type { SettingsEditFormValues } from '../../types'

type SettingsEditFormRenderProps = {
  saved: boolean
  register: UseFormRegister<SettingsEditFormValues>
  errors: FieldErrors<SettingsEditFormValues>
  onSubmit: (e: FormEvent) => void
}

export const SettingsEditFormRender = ({
  saved,
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
    <Field label="Города подачи" error={errors.cities?.message}>
      <input className="field" {...register('cities')} />
    </Field>
    <Field label="Направления" error={errors.destinations?.message}>
      <input className="field" {...register('destinations')} />
    </Field>
    <Field
      label="Прокси Webshare для автозаполнения"
      error={errors.webshareProxyEnabled?.message}
    >
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register('webshareProxyEnabled')} />
        Использовать разные IP из Webshare при автозаполнении
      </label>
      <p className="mt-1 text-xs text-muted">
        Нужен непустой WEBSHARE_API_KEY на сервере. Список IP обновляется по TTL
        из окружения.
      </p>
    </Field>
    <Field label="ID плана Webshare (необязательно)" error={errors.websharePlanId?.message}>
      <input
        className="field"
        maxLength={120}
        placeholder="Пусто = план по умолчанию в Webshare"
        {...register('websharePlanId')}
      />
    </Field>
    <Btn type="submit">{saved ? 'Сохранено' : 'Сохранить'}</Btn>
  </form>
)
