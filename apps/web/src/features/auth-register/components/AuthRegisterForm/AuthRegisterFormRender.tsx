import { Btn, Field } from '@/shared/ui'
import { AUTH_REGISTER_FORM_CLASS, AUTH_REGISTER_MESSAGES } from '../../constants'
import type { AuthRegisterFormRenderProps } from '../../types'

export const AuthRegisterFormRender = ({
  apiError,
  register,
  errors,
  onSubmit,
}: AuthRegisterFormRenderProps): React.ReactElement => (
  <form onSubmit={onSubmit} className={AUTH_REGISTER_FORM_CLASS}>
    <div>
      <p className="text-sm font-semibold text-text-primary">{AUTH_REGISTER_MESSAGES.title}</p>
      <p className="mt-1 text-sm text-text-secondary">{AUTH_REGISTER_MESSAGES.subtitle}</p>
    </div>
    <div className="space-y-3">
      <Field
        label={AUTH_REGISTER_MESSAGES.firstNameLabel}
        error={errors.firstName?.message}
      >
        <input className="field" autoComplete="given-name" {...register('firstName')} />
      </Field>
      <Field
        label={AUTH_REGISTER_MESSAGES.lastNameLabel}
        error={errors.lastName?.message}
      >
        <input className="field" autoComplete="family-name" {...register('lastName')} />
      </Field>
      <Field label={AUTH_REGISTER_MESSAGES.loginLabel} error={errors.login?.message}>
        <input className="field" autoComplete="username" {...register('login')} />
      </Field>
      <Field label={AUTH_REGISTER_MESSAGES.emailLabel} error={errors.email?.message}>
        <input className="field" type="email" autoComplete="email" {...register('email')} />
      </Field>
      <Field
        label={AUTH_REGISTER_MESSAGES.passwordLabel}
        error={errors.password?.message}
      >
        <input
          className="field"
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
      </Field>
    </div>
    {apiError ? <p className="text-sm font-semibold text-danger">{apiError}</p> : null}
    <div>
      <Btn type="submit" className="h-11 w-full">
        {AUTH_REGISTER_MESSAGES.submit}
      </Btn>
    </div>
  </form>
)
