import { useState, type ReactNode } from 'react'
import { useStore } from '@/app/providers'
import { LOCKED_SUBMIT_CITIES } from '@/entities/settings'
import { SettingsEditForm } from '@/features/settings-edit'
import { WebshareProxiesPanel } from '@/features/webshare-proxies'
import { SettingsRender } from './SettingsRender'

export const SettingsPage = () => {
  const { session, settings, saveSettings, resetDemo } = useStore()
  const isAdmin = session?.role === 'admin'
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [editFormKey, setEditFormKey] = useState(0)

  const onResetDemo = async () => {
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
      lockedCitiesLabel={LOCKED_SUBMIT_CITIES.join(', ')}
      defaultValues={{
        company: settings.company,
        price: String(settings.defaultPrice),
        destinations: settings.destinations.join(', '),
        websharePlanId: settings.websharePlanId ?? '',
      }}
      saved={saved}
      onValidSubmit={async ({ company, price, destinations, websharePlanId }) => {
        setError('')
        setSaved(false)
        try {
          await saveSettings({
            company: company.trim() || 'Vises',
            defaultPrice: Number(price) || 0,
            cities: [...LOCKED_SUBMIT_CITIES],
            destinations: destinations
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean),
            websharePlanId: websharePlanId.trim(),
          })
          setSaved(true)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Не удалось сохранить настройки')
        }
      }}
    />
  ) : null

  const websharePanel: ReactNode = isAdmin ? <WebshareProxiesPanel /> : null

  return (
    <SettingsRender
      isAdmin={isAdmin}
      settingsForm={settingsForm}
      websharePanel={websharePanel}
      error={error}
      settingsCompany={settings.company}
      settingsCities={settings.cities}
      demoControlsEnabled={Boolean(settings.demoControlsEnabled)}
      onResetDemo={() => void onResetDemo()}
    />
  )
}
