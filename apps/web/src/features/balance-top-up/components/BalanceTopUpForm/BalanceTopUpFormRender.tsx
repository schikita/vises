import { useTranslation } from 'react-i18next'
import { Btn, Field } from '@/shared/ui'
import type { BalanceTopUpFormRenderProps } from '../../types'

export const BalanceTopUpFormRender = ({
  apiError,
  saved,
  pending,
  register,
  errors,
  onSubmit,
}: BalanceTopUpFormRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <Field label={t('balance.topUp.amountLabel')} error={errors.amount?.message} required>
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
      <p className="text-xs text-text-secondary">{t('balance.topUp.hint')}</p>
      {apiError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {apiError}
        </p>
      ) : null}
      {saved && !apiError ? (
        <p className="text-sm font-medium text-success" role="status">
          {t('balance.topUp.saved')}
        </p>
      ) : null}
      <Btn type="submit" disabled={pending}>
        {pending ? t('balance.topUp.submitting') : t('balance.topUp.submit')}
      </Btn>
    </form>
  )
}
