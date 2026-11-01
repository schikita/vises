import { useTranslation } from 'react-i18next'
import type { PricePerClientHintRenderProps } from '../../types'

export const PricePerClientHintRender = ({
  className,
  loading,
  error,
  pricePerClient,
}: PricePerClientHintRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  if (loading) {
    return (
      <p className={className} role="status">
        {t('settingsPrice.hint.loading')}
      </p>
    )
  }

  if (error) {
    return (
      <p className={className} role="alert">
        {error}
      </p>
    )
  }

  if (!pricePerClient) {
    return (
      <p className={className} role="status">
        {t('settingsPrice.hint.empty')}
      </p>
    )
  }

  return (
    <p className={className} role="note">
      {t('settingsPrice.hint.text', { price: pricePerClient })}
    </p>
  )
}
