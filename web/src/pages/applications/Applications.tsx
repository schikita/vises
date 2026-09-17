import { useMemo, useState } from 'react'
import { useStore } from '@/app/providers'
import type { Status } from '@/entities/application'
import { staffBase } from '@/entities/session'
import { ApplicationsRender } from './ApplicationsRender'

export const Applications = () => {
  const { apps, session } = useStore()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<Status | 'all'>('all')
  const [city, setCity] = useState('all')

  const cities = [...new Set(apps.map((a) => a.submitCity))]
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return apps.filter((a) => {
      if (status !== 'all' && a.status !== status) return false
      if (city !== 'all' && a.submitCity !== city) return false
      if (!query) return true
      const blob = [
        a.code,
        a.destination,
        a.submitCity,
        ...a.applicants.flatMap((p) => [p.firstName, p.lastName, p.passportNumber]),
      ]
        .join(' ')
        .toLowerCase()
      return blob.includes(query)
    })
  }, [apps, q, status, city])

  return (
    <ApplicationsRender
      appsCount={apps.length}
      filtered={filtered}
      cities={cities}
      q={q}
      status={status}
      city={city}
      appsBase={`${staffBase(session?.role)}/apps`}
      onQueryChange={setQ}
      onStatusChange={setStatus}
      onCityChange={setCity}
    />
  )
}
