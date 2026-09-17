import { useStore } from '@/app/providers'
import { money, type Status } from '@/entities/application'
import { staffBase } from '@/entities/session'
import { DashboardRender } from './DashboardRender'

export const Dashboard = () => {
  const { apps, session } = useStore()
  const unpaid = apps.filter((a) => !a.paymentPaid).reduce((s, a) => s + a.paymentAmount, 0)
  const paid = apps.filter((a) => a.paymentPaid).reduce((s, a) => s + a.paymentAmount, 0)
  const byStatus = (id: Status) => apps.filter((a) => a.status === id).length
  const cities = [...new Set(apps.map((a) => a.submitCity))]
  const upcoming = apps
    .filter((a) => a.status === 'booked' && a.visitDate)
    .sort((a, b) => a.visitDate.localeCompare(b.visitDate))

  const kpis = [
    ['Заявки', String(apps.length)],
    ['Заявители', String(apps.reduce((s, a) => s + a.applicants.length, 0))],
    ['Визиты', String(apps.filter((a) => a.status === 'booked' || a.status === 'done').length)],
    ['Оплачено', money(paid)],
    ['Не оплачено', money(unpaid)],
  ]

  return (
    <DashboardRender
      apps={apps}
      appsCount={apps.length}
      kpis={kpis}
      cities={cities}
      upcoming={upcoming}
      byStatus={byStatus}
      appsBase={`${staffBase(session?.role)}/apps`}
    />
  )
}
