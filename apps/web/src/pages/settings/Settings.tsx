import { useState, type ReactElement, type ReactNode } from 'react'
import { useStore } from '@/app/providers'
import { Proxy6ProxiesPanel } from '@/features/proxy6-proxies'
import { SettingsEditForm } from '@/features/settings-edit'
import { SettingsRender } from './SettingsRender'

export const SettingsPage = (): ReactElement => {
  const { session, settings, saveSettings, resetDemo } = useStore()
  const isAdmin = session?.role === 'admin' || session?.role === 'superadmin'
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [editFormKey, setEditFormKey] = useState(0)

  const onResetDemo = async (): Promise<void> => {
    setError('')
    try {
      await resetDemo()
      setSaved(false)
      setEditFormKey((key) => key + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сбросить демо')
    }
  }

  const settingsForm: ReactNode = isAdmin ? (
    <SettingsEditForm
      key={editFormKey}
      defaultValues={{
        company: settings.company,
        price: String(settings.defaultPrice),
        cities: [...settings.cities],
        destinations: [...settings.destinations],
      }}
      saved={saved}
      onValidSubmit={async ({ company, price, cities, destinations }) => {
        setError('')
        setSaved(false)
        try {
          await saveSettings({
            company: company.trim() || 'Vises',
            defaultPrice: Number(price) || 0,
            cities,
            destinations,
          })
          setSaved(true)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Не удалось сохранить настройки')
          throw err
        }
      }}
    />
  ) : null

  const proxy6Panel: ReactNode = isAdmin ? <Proxy6ProxiesPanel /> : null

  return (
    <SettingsRender
      isAdmin={isAdmin}
      settingsForm={settingsForm}
      proxy6Panel={proxy6Panel}
      error={error}
      settingsCompany={settings.company}
      settingsCities={settings.cities}
      settingsDestinations={settings.destinations}
      demoControlsEnabled={Boolean(settings.demoControlsEnabled)}
      onResetDemo={() => void onResetDemo()}
    />
  )
}
