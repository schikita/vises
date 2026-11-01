import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { SettingsDto } from '@vises/contracts'
import { SETTINGS_QUERY_KEYS, fetchSettings } from '@/entities/settings'
import { resolveApiErrorI18nKey } from '@/shared/api'
import type { PricePerClientHintProps } from '../../types'
import { PricePerClientHintRender } from './PricePerClientHintRender'

/**
 * Agent-facing inline UX hint for create-client (FR-10 / AC-13).
 * Reads `price_per_client` as the API decimal string — no float re-round.
 * Not a settings page; compose into client-create (FE9).
 */
export const PricePerClientHint = ({
  className,
}: PricePerClientHintProps): React.ReactElement => {
  const { t } = useTranslation()
  const query = useQuery({
    queryKey: SETTINGS_QUERY_KEYS.detail(),
    queryFn: (): Promise<SettingsDto> => fetchSettings(),
  })

  const error = query.isError ? t(resolveApiErrorI18nKey(query.error)) : ''

  return (
    <PricePerClientHintRender
      className={className}
      loading={query.isLoading}
      error={error}
      pricePerClient={query.data?.price_per_client ?? null}
    />
  )
}
