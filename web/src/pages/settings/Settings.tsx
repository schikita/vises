import { useState, type ReactNode } from 'react'
import { useStore } from '@/app/providers'
import { SettingsEditForm } from '@/features/settings-edit'
import { SettingsRender } from './SettingsRender'

export const SettingsPage = () => {
  const { session, settings, saveSettings, resetDemo } = useStore()
  const isAdmin = session?.role === 'admin'
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const onResetDemo = async () => {
    setError('')
    try {
      await resetDemo()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сбросить демо')
    }
  }

  const settingsForm: ReactNode = isAdmin ? (
    <SettingsEditForm
      defaultValues={{
        company: settings.company,
        price: String(settings.defaultPrice),
        cities: settings.cities.join(', '),
        destinations: settings.destinations.join(', '),
        webshareProxyEnabled: settings.webshareProxyEnabled,
        websharePlanId: settings.websharePlanId ?? '',
      }}
      saved={saved}
      onValidSubmit={async ({
        company,
        price,
        cities,
        destinations,
        webshareProxyEnabled,
        websharePlanId,
      }) => {
        setError('')
        setSaved(false)
        try {
          await saveSettings({
            company: company.trim() || 'Vises',
            defaultPrice: Number(price) || 0,
            cities: cities
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean),
            destinations: destinations
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean),
            webshareProxyEnabled,
            websharePlanId: websharePlanId.trim(),
          })
          setSaved(true)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Не удалось сохранить настройки')
        }
      }}
    />
  ) : null

  return (
    <SettingsRender
      isAdmin={isAdmin}
      settingsForm={settingsForm}
      error={error}
      settingsCompany={settings.company}
      settingsCities={settings.cities}
      onResetDemo={() => void onResetDemo()}
    />
  )
}
