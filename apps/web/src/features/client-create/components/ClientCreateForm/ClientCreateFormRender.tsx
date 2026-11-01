import { useTranslation } from 'react-i18next'
import { Btn, Field } from '@/shared/ui'
import type { ClientCreateFormRenderProps } from '../../types'

export const ClientCreateFormRender = ({
  apiError,
  pending,
  priceHint,
  register,
  errors,
  onSubmit,
}: ClientCreateFormRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <form className="space-y-3" onSubmit={onSubmit} noValidate>
      {priceHint}
      <Field label={t('applicant.fields.email')} error={errors.email?.message}>
        <input
          className="field"
          type="email"
          autoComplete="email"
          disabled={pending}
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
      </Field>
      <Field label={t('applicant.fields.phone')} error={errors.phone?.message}>
        <input
          className="field"
          type="tel"
          autoComplete="tel"
          disabled={pending}
          {...register('phone')}
        />
      </Field>
      <Field label={t('applicant.fields.address')} error={errors.address?.message}>
        <input className="field" disabled={pending} {...register('address')} />
      </Field>
      <Field label={t('applicant.fields.purpose')} error={errors.purpose?.message}>
        <input className="field" disabled={pending} {...register('purpose')} />
      </Field>
      {apiError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {apiError}
        </p>
      ) : null}
      <Btn type="submit" disabled={pending} className="w-full">
        {pending ? t('clients.create.submitting') : t('clients.create.submit')}
      </Btn>
    </form>
  )
}
