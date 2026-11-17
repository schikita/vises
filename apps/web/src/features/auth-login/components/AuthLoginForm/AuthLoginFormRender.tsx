import type { FormEvent } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Btn, Field } from '@/shared/ui'
import { AUTH_LOGIN_MESSAGES } from '../../constants'
import type { AuthLoginFormValues } from '../../types'

type AuthLoginFormRenderProps = {
  apiError: string
  register: UseFormRegister<AuthLoginFormValues>
  errors: FieldErrors<AuthLoginFormValues>
  onSubmit: (e: FormEvent) => void
}

export const AuthLoginFormRender = ({
  apiError,
  register,
  errors,
  onSubmit,
}: AuthLoginFormRenderProps) => (
  <form
    onSubmit={onSubmit}
    className="rounded-[28px] border border-line bg-card p-6 shadow-[0_20px_50px_rgba(18,24,20,0.06)]"
  >
    <p className="text-sm font-bold">Вход</p>
    <p className="mt-1 text-sm text-muted">{AUTH_LOGIN_MESSAGES.subtitle}</p>
    <div className="mt-5 space-y-3">
      <Field label="Логин" error={errors.login?.message}>
        <input className="field" autoComplete="username" {...register('login')} />
      </Field>
      <Field label="Пароль" error={errors.password?.message}>
        <input
          className="field"
          type="password"
          autoComplete="current-password"
          {...register('password')}
        />
      </Field>
    </div>
    {apiError && <p className="mt-3 text-sm font-semibold text-clay">{apiError}</p>}
    <div className="mt-4">
      <Btn type="submit" className="w-full h-11">
        Войти
      </Btn>
    </div>
    <p className="mt-3 text-center text-sm text-muted">
      {AUTH_LOGIN_MESSAGES.noAccountPrompt}{' '}
      <Link className="font-semibold text-leaf" to="/register">
        {AUTH_LOGIN_MESSAGES.registerLinkLabel}
      </Link>
    </p>
  </form>
)
