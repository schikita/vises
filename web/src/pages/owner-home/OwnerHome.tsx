import { useStore } from '@/app/providers'
import { money, type Status } from '@/entities/application'
import { OwnerHomeRender } from './OwnerHomeRender'

export const OwnerHome = () => {
  const { apps, users } = useStore()
  const unpaid = apps.filter((a) => !a.paymentPaid).reduce((s, a) => s + a.paymentAmount, 0)
  const paid = apps.filter((a) => a.paymentPaid).reduce((s, a) => s + a.paymentAmount, 0)
  const byRole = (role: 'admin' | 'manager' | 'client') =>
    users.filter((u) => u.role === role).length
  const byStatus = (id: Status) => apps.filter((a) => a.status === id).length
  const recent = [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  const kpis = [
    ['Пользователи', String(users.length)],
    ['Клиенты', String(byRole('client'))],
    ['Агенты', String(byRole('manager'))],
    ['Заявки', String(apps.length)],
    ['Не оплачено', money(unpaid)],
  ]

  return (
    <OwnerHomeRender
      kpis={kpis}
      recent={recent}
      paid={money(paid)}
      reviewCount={byStatus('review')}
      fixesCount={byStatus('fixes')}
      inactiveCount={users.filter((u) => !u.active).length}
    />
  )
}
