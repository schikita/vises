import { useMemo, useState } from 'react'
import { useStore } from '@/app/providers'
import { staffBase } from '@/entities/session'
import { VisitsRender } from './VisitsRender'

export const Visits = () => {
  const { apps, session } = useStore()
  const [city, setCity] = useState('all')
  const [onlyUpcoming, setOnlyUpcoming] = useState(true)
  const today = new Date().toISOString().slice(0, 10)
  const cities = [...new Set(apps.map((a) => a.submitCity).filter(Boolean))]

  const visits = useMemo(() => {
    return apps
      .filter((a) => a.visitDate || a.status === 'booked' || a.status === 'done')
      .filter((a) => (city === 'all' ? true : a.submitCity === city))
      .filter((a) => (onlyUpcoming ? a.visitDate >= today && a.status !== 'done' : true))
      .sort((a, b) => `${a.visitDate} ${a.visitTime}`.localeCompare(`${b.visitDate} ${b.visitTime}`))
  }, [apps, city, onlyUpcoming, today])

  return (
    <VisitsRender
      visits={visits}
      cities={cities}
      city={city}
      onlyUpcoming={onlyUpcoming}
      appsBase={`${staffBase(session?.role)}/apps`}
      onCityChange={setCity}
      onToggleUpcoming={() => setOnlyUpcoming((v) => !v)}
    />
  )
}
