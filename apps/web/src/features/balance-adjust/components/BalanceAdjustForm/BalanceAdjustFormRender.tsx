import { useTranslation } from 'react-i18next'
import { Btn, Field } from '@/shared/ui'
import type { BalanceAdjustFormRenderProps } from '../../types'

export const BalanceAdjustFormRender = ({
  apiError,
  saved,
  pending,
  register,
  errors,
  onSubmit,
}: BalanceAdjustFormRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <Field
        label={t('balance.adjust.amountLabel')}
        error={errors.amount?.message}
        required
      >
        <input
          className="field"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={Boolean(errors.amount)}
          disabled={pending}
          {...register('amount')}
        />
      </Field>
      <Field
        label={t('balance.adjust.reasonLabel')}
        error={errors.reason?.message}
        required
      >
        <input
          className="field"
          type="text"
          autoComplete="off"
          aria-invalid={Boolean(errors.reason)}
          disabled={pending}
          {...register('reason')}
        />
      </Field>
      <p className="text-xs text-text-secondary">{t('balance.adjust.hint')}</p>
      {apiError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {apiError}
        </p>
      ) : null}
      {saved && !apiError ? (
        <p className="text-sm font-medium text-success" role="status">
          {t('balance.adjust.saved')}
        </p>
      ) : null}
      <Btn type="submit" disabled={pending}>
        {pending ? t('balance.adjust.submitting') : t('balance.adjust.submit')}
      </Btn>
    </form>
  )
}
