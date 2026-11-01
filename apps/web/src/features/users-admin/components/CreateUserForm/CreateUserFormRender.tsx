import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Btn, Field } from '@/shared/ui'
import type { CreateUserFormRenderProps } from '../../types'

export const CreateUserFormRender = ({
  apiError,
  allowedRoles,
  register,
  errors,
  onSubmit,
}: CreateUserFormRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <Field label={t('usersAdmin.form.name')} error={errors.name?.message}>
        <input className="field" {...register('name')} />
      </Field>
      <Field label={t('usersAdmin.form.email')} error={errors.email?.message}>
        <input
          className="field"
          type="email"
          placeholder={t('usersAdmin.form.emailPlaceholder')}
          {...register('email')}
        />
      </Field>
      <Field label={t('usersAdmin.form.login')} error={errors.login?.message}>
        <input
          className="field"
          placeholder={t('usersAdmin.form.loginPlaceholder')}
          {...register('login')}
        />
      </Field>
      <Field label={t('usersAdmin.form.role')} error={errors.role?.message}>
        <select className="field" {...register('role')}>
          {allowedRoles.map((role) => (
            <option key={role} value={role}>
              {t(`usersAdmin.roles.${role}`)}
            </option>
          ))}
        </select>
      </Field>
      {apiError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {apiError}
        </p>
      ) : null}
      <Btn type="submit" className="w-full">
        <Plus size={16} />
        {t('usersAdmin.form.submit')}
      </Btn>
    </form>
  )
}
