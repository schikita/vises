import { useTranslation } from 'react-i18next'
import { Btn, Field } from '@/shared/ui'
import { CLIENT_PASSPORT_FORM_FIELDS } from '../../constants'
import type { ClientPassportEditFormRenderProps } from '../../types'

export const ClientPassportEditFormRender = ({
  apiError,
  saved,
  pending,
  register,
  errors,
  onSubmit,
}: ClientPassportEditFormRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <form className="space-y-3" onSubmit={onSubmit} noValidate>
      <p className="text-xs text-text-secondary">{t('clients.passport.hint')}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {CLIENT_PASSPORT_FORM_FIELDS.map(
          (field): React.ReactElement => (
            <Field
              key={field}
              label={t(`applicant.fields.${field}`)}
              error={errors[field]?.message}
            >
              <input
                className="field"
                autoComplete="off"
                disabled={pending}
                aria-invalid={Boolean(errors[field])}
                {...register(field)}
              />
            </Field>
          ),
        )}
      </div>
      {apiError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {apiError}
        </p>
      ) : null}
      {saved && !apiError ? (
        <p className="text-sm font-medium text-success" role="status">
          {t('clients.passport.saved')}
        </p>
      ) : null}
      <Btn type="submit" disabled={pending}>
        {pending ? t('clients.passport.submitting') : t('clients.passport.submit')}
      </Btn>
    </form>
  )
}
