import { Btn, Field } from '@/shared/ui'
import { AUTH_LOGIN_FORM_CLASS, AUTH_LOGIN_MESSAGES } from '../../constants'
import type { AuthLoginFormRenderProps } from '../../types'

export const AuthLoginFormRender = ({
  apiError,
  register,
  errors,
  onSubmit,
}: AuthLoginFormRenderProps): React.ReactElement => (
  <form onSubmit={onSubmit} className={AUTH_LOGIN_FORM_CLASS}>
    <div>
      <p className="text-sm font-semibold text-text-primary">
        {AUTH_LOGIN_MESSAGES.title}
      </p>
      <p className="mt-1 text-sm text-text-secondary">{AUTH_LOGIN_MESSAGES.subtitle}</p>
    </div>
    <div className="space-y-3">
      <Field label={AUTH_LOGIN_MESSAGES.identifierLabel} error={errors.identifier?.message}>
        <input className="field" autoComplete="username" {...register('identifier')} />
      </Field>
      <Field label={AUTH_LOGIN_MESSAGES.passwordLabel} error={errors.password?.message}>
        <input
          className="field"
          type="password"
          autoComplete="current-password"
          {...register('password')}
        />
      </Field>
    </div>
    {apiError ? <p className="text-sm font-semibold text-danger">{apiError}</p> : null}
    <div>
      <Btn type="submit" className="h-11 w-full">
        {AUTH_LOGIN_MESSAGES.submit}
      </Btn>
    </div>
  </form>
)
