import { useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  SETTINGS_QUERY_KEYS,
  fetchSettings,
  normalizeSettingsDetail,
  patchSettings,
  type SettingsDetailDto,
} from '@/entities/settings'
import { Proxy6ProxiesPanel } from '@/features/proxy6-proxies'
import { SettingsCityDestinationForm } from '@/features/settings-city-destination-edit'
import { SettingsPriceEditForm } from '@/features/settings-price-edit'
import { resolveApiErrorI18nKey } from '@/shared/api'
import { SettingsRender } from './SettingsRender'

/**
 * Staff settings page (`/admin/settings`):
 * price, cities→destinations tags, Proxy6 — against shared API (no backend change).
 */
export const SettingsPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [priceApiError, setPriceApiError] = useState('')
  const [priceSaved, setPriceSaved] = useState(false)
  const [listsApiError, setListsApiError] = useState('')
  const [listsSaved, setListsSaved] = useState(false)

  const settingsQuery = useQuery({
    queryKey: SETTINGS_QUERY_KEYS.detail(),
    queryFn: (): Promise<SettingsDetailDto> => fetchSettings(),
  })

  const settings = useMemo(
    () => normalizeSettingsDetail(settingsQuery.data),
    [settingsQuery.data],
  )

  const patchMutation = useMutation({
    mutationFn: patchSettings,
    onSuccess: async (data): Promise<void> => {
      queryClient.setQueryData(SETTINGS_QUERY_KEYS.detail(), data)
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.all })
    },
  })

  const priceDefaultValues = useMemo(
    () => ({
      price_per_client: settings.price_per_client,
    }),
    [settings.price_per_client],
  )

  const listsDefaultValues = useMemo(
    () => ({
      cities: [...settings.cities],
      destinations: [...settings.destinations],
    }),
    [settings.cities, settings.destinations],
  )

  const loadError = settingsQuery.isError
    ? t(resolveApiErrorI18nKey(settingsQuery.error))
    : ''

  const priceForm: ReactNode =
    settingsQuery.data !== undefined ? (
      <SettingsPriceEditForm
        key={`price-${settings.price_per_client}`}
        defaultValues={priceDefaultValues}
        apiError={priceApiError}
        saved={priceSaved}
        pending={patchMutation.isPending}
        onValidSubmit={async ({ price_per_client }): Promise<boolean> => {
          setPriceApiError('')
          setPriceSaved(false)
          try {
            await patchMutation.mutateAsync({ price_per_client })
            setPriceSaved(true)
            return true
          } catch (err) {
            setPriceApiError(t(resolveApiErrorI18nKey(err)))
            return false
          }
        }}
      />
    ) : null

  const cityDestinationForm: ReactNode =
    settingsQuery.data !== undefined ? (
      <SettingsCityDestinationForm
        key={`lists-${settings.cities.join('|')}-${settings.destinations.join('|')}`}
        defaultValues={listsDefaultValues}
        apiError={listsApiError}
        saved={listsSaved}
        pending={patchMutation.isPending}
        onValidSubmit={async ({ cities, destinations }): Promise<boolean> => {
          setListsApiError('')
          setListsSaved(false)
          try {
            await patchMutation.mutateAsync({ cities, destinations })
            setListsSaved(true)
            return true
          } catch (err) {
            setListsApiError(t(resolveApiErrorI18nKey(err)))
            return false
          }
        }}
      />
    ) : null

  const proxy6Panel: ReactNode =
    settingsQuery.data !== undefined ? <Proxy6ProxiesPanel /> : null

  return (
    <SettingsRender
      loading={settingsQuery.isLoading}
      loadError={loadError}
      priceForm={priceForm}
      cityDestinationForm={cityDestinationForm}
      proxy6Panel={proxy6Panel}
      currentPrice={settingsQuery.data ? settings.price_per_client : null}
      currentCities={settings.cities}
      currentDestinations={settings.destinations}
    />
  )
}
