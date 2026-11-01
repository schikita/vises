import { useTranslation } from 'react-i18next'
import { Btn, Field } from '@/shared/ui'
import type { SettingsPriceEditFormRenderProps } from '../../types'

export const SettingsPriceEditFormRender = ({
  apiError,
  saved,
  pending,
  register,
  errors,
  onSubmit,
}: SettingsPriceEditFormRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Field
        label={t('settingsPrice.form.priceLabel')}
        error={errors.price_per_client?.message}
      >
        <input
          className="field"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={Boolean(errors.price_per_client)}
          disabled={pending}
          {...register('price_per_client')}
        />
      </Field>
      <p className="text-xs text-text-secondary">{t('settingsPrice.form.hint')}</p>
      {apiError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {apiError}
        </p>
      ) : null}
      {saved && !apiError ? (
        <p className="text-sm font-medium text-success" role="status">
          {t('settingsPrice.form.saved')}
        </p>
      ) : null}
      <Btn type="submit" disabled={pending}>
        {pending ? t('settingsPrice.form.saving') : t('settingsPrice.form.submit')}
      </Btn>
    </form>
  )
}
