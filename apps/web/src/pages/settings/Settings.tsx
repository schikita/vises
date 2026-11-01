import { useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { SettingsDto } from '@vises/contracts'
import {
  SETTINGS_QUERY_KEYS,
  fetchSettings,
  patchSettings,
} from '@/entities/settings'
import { SettingsPriceEditForm } from '@/features/settings-price-edit'
import { resolveApiErrorI18nKey } from '@/shared/api'
import { SettingsRender } from './SettingsRender'

/**
 * Staff settings page (`/admin/settings`) — read/edit `price_per_client` (FE7 / AC-13).
 * Agents have no settings route; they use `PricePerClientHint` inline (FE9).
 */
export const SettingsPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [apiError, setApiError] = useState('')
  const [saved, setSaved] = useState(false)

  const settingsQuery = useQuery({
    queryKey: SETTINGS_QUERY_KEYS.detail(),
    queryFn: (): Promise<SettingsDto> => fetchSettings(),
  })

  const patchMutation = useMutation({
    mutationFn: patchSettings,
    onSuccess: async (data): Promise<void> => {
      setApiError('')
      setSaved(true)
      queryClient.setQueryData(SETTINGS_QUERY_KEYS.detail(), data)
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.all })
    },
    onError: (err: unknown): void => {
      setSaved(false)
      setApiError(t(resolveApiErrorI18nKey(err)))
    },
  })

  const defaultValues = useMemo(
    () => ({
      price_per_client: settingsQuery.data?.price_per_client ?? '',
    }),
    [settingsQuery.data?.price_per_client],
  )

  const loadError = settingsQuery.isError
    ? t(resolveApiErrorI18nKey(settingsQuery.error))
    : ''

  const priceForm: ReactNode =
    settingsQuery.data !== undefined ? (
      <SettingsPriceEditForm
        key={settingsQuery.data.price_per_client}
        defaultValues={defaultValues}
        apiError={apiError}
        saved={saved}
        pending={patchMutation.isPending}
        onValidSubmit={async ({ price_per_client }): Promise<boolean> => {
          setApiError('')
          setSaved(false)
          try {
            await patchMutation.mutateAsync({ price_per_client })
            return true
          } catch {
            return false
          }
        }}
      />
    ) : null

  return (
    <SettingsRender
      loading={settingsQuery.isLoading}
      loadError={loadError}
      priceForm={priceForm}
      currentPrice={settingsQuery.data?.price_per_client ?? null}
    />
  )
}
