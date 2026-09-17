import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Btn, Field } from '@/shared/ui'
import type { CreateUserFormValues } from '../../types'

type CreateUserFormRenderProps = {
  apiError: string
  register: UseFormRegister<CreateUserFormValues>
  errors: FieldErrors<CreateUserFormValues>
  onSubmit: (e: FormEvent) => void
}

export const CreateUserFormRender = ({
  apiError,
  register,
  errors,
  onSubmit,
}: CreateUserFormRenderProps) => (
  <form className="space-y-3" onSubmit={onSubmit}>
    <Field label="Имя" error={errors.name?.message}>
      <input className="field" {...register('name')} />
    </Field>
    <Field label="Email" error={errors.email?.message}>
      <input
        className="field"
        type="email"
        placeholder="необязательно, можно только логин"
        {...register('email')}
      />
    </Field>
    <Field label="Логин" error={errors.login?.message}>
      <input
        className="field"
        placeholder="если пусто — из email или имени"
        {...register('login')}
      />
    </Field>
    <Field label="Роль" error={errors.role?.message}>
      <select className="field" {...register('role')}>
        <option value="client">Клиент</option>
        <option value="manager">Агент</option>
        <option value="admin">Админ</option>
      </select>
    </Field>
    {apiError && <p className="text-sm font-semibold text-clay">{apiError}</p>}
    <Btn type="submit" className="w-full">
      <Plus size={16} />
      Создать и выдать ссылку
    </Btn>
  </form>
)
