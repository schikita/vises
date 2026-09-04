import { useState } from 'react'
import { useStore } from '../store'
import { Btn, Card, Field } from '../ui'

export function SettingsPage() {
  const { session, settings, saveSettings, resetDemo } = useStore()
  const isAdmin = session?.role === 'admin'
  const [company, setCompany] = useState(settings.company)
  const [price, setPrice] = useState(String(settings.defaultPrice))
  const [cities, setCities] = useState(settings.cities.join(', '))
  const [destinations, setDestinations] = useState(settings.destinations.join(', '))
  const [saved, setSaved] = useState(false)

  function save() {
    void saveSettings({
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
    }).then(() => setSaved(true))
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Настройки</h1>
      {isAdmin ? (
        <Card className="mt-5 space-y-4">
          <p className="font-bold">Система</p>
          <Field label="Название">
            <input className="field" value={company} onChange={(e) => setCompany(e.target.value)} />
          </Field>
          <Field label="Цена заявки по умолчанию, ₽">
            <input
              className="field"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Field>
          <Field label="Города подачи">
            <input className="field" value={cities} onChange={(e) => setCities(e.target.value)} />
          </Field>
          <Field label="Направления">
            <input
              className="field"
              value={destinations}
              onChange={(e) => setDestinations(e.target.value)}
            />
          </Field>
          <Btn onClick={save}>{saved ? 'Сохранено' : 'Сохранить'}</Btn>
        </Card>
      ) : (
        <Card className="mt-5">
          <p className="font-bold">{settings.company}</p>
          <p className="mt-1 text-sm text-muted">
            Города: {settings.cities.join(', ')}. Изменить может только админ.
          </p>
        </Card>
      )}

      <Card className="mt-5 space-y-3">
        <p className="font-bold">Демо-данные</p>
        <p className="text-sm text-muted">
          Сброс вернёт заявки, пользователей и настройки к исходному набору.
        </p>
        <Btn variant="soft" onClick={() => void resetDemo()}>
          Сбросить демо
        </Btn>
      </Card>
    </div>
  )
}
