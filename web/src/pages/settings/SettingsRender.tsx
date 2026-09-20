import type { ReactNode } from 'react'
import { Btn, Card } from '@/shared/ui'

type SettingsRenderProps = {
  isAdmin: boolean
  settingsForm: ReactNode
  websharePanel: ReactNode
  error: string
  settingsCompany: string
  settingsCities: string[]
  demoControlsEnabled: boolean
  onResetDemo: () => void
}

export const SettingsRender = ({
  isAdmin,
  settingsForm,
  websharePanel,
  error,
  settingsCompany,
  settingsCities,
  demoControlsEnabled,
  onResetDemo,
}: SettingsRenderProps) => (
  <div className="max-w-xl">
    <h1 className="text-2xl font-extrabold tracking-tight">Настройки</h1>
    {isAdmin ? (
      <Card className="mt-5 space-y-4">
        <p className="font-bold">Система</p>
        {settingsForm}
      </Card>
    ) : (
      <Card className="mt-5">
        <p className="font-bold">{settingsCompany}</p>
        <p className="mt-1 text-sm text-muted">
          Города: {settingsCities.join(', ')}. Изменить может только админ.
        </p>
      </Card>
    )}

    {isAdmin && websharePanel ? (
      <Card className="mt-5 space-y-3">{websharePanel}</Card>
    ) : null}

    {isAdmin && demoControlsEnabled ? (
      <Card className="mt-5 space-y-3">
        <p className="font-bold">Демо-данные</p>
        <p className="text-sm text-muted">
          Сброс вернёт заявки, пользователей и настройки к исходному набору.
        </p>
        <Btn variant="soft" onClick={onResetDemo}>
          Сбросить демо
        </Btn>
      </Card>
    ) : null}

    {error && <p className="mt-4 text-sm font-semibold text-clay">{error}</p>}
  </div>
)
