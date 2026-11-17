import type { ReactElement } from 'react'
import { Btn, Field } from '@/shared/ui'
import { AUTH_REGISTER_FORM_CLASS, AUTH_REGISTER_MESSAGES } from '../../constants'
import type { AuthRegisterFormRenderProps } from '../../types'

export const AuthRegisterFormRender = ({
  apiError,
  register,
  errors,
  onSubmit,
}: AuthRegisterFormRenderProps): ReactElement => (
  <form onSubmit={onSubmit} className={AUTH_REGISTER_FORM_CLASS}>
    <p className="text-sm font-bold">{AUTH_REGISTER_MESSAGES.title}</p>
    <p className="mt-1 text-sm text-muted">{AUTH_REGISTER_MESSAGES.subtitle}</p>
    <div className="mt-5 space-y-3">
      <Field label={AUTH_REGISTER_MESSAGES.nameLabel} error={errors.name?.message}>
        <input className="field" autoComplete="name" {...register('name')} />
      </Field>
      <Field label={AUTH_REGISTER_MESSAGES.loginLabel} error={errors.login?.message}>
        <input className="field" autoComplete="username" {...register('login')} />
      </Field>
      <Field label={AUTH_REGISTER_MESSAGES.emailLabel} error={errors.email?.message}>
        <input className="field" type="email" autoComplete="email" {...register('email')} />
      </Field>
      <Field label={AUTH_REGISTER_MESSAGES.passwordLabel} error={errors.password?.message}>
        <input
          className="field"
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
      </Field>
    </div>
    {apiError ? <p className="mt-3 text-sm font-semibold text-clay">{apiError}</p> : null}
    <div className="mt-4">
      <Btn type="submit" className="h-11 w-full">
        {AUTH_REGISTER_MESSAGES.submit}
      </Btn>
    </div>
  </form>
)
