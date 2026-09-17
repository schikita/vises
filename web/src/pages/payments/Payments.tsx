import { useStore } from '@/app/providers'
import { money } from '@/entities/application'
import { staffBase } from '@/entities/session'
import { PaymentsRender } from './PaymentsRender'

export const Payments = () => {
  const { apps, session } = useStore()
  const paid = apps.filter((a) => a.paymentPaid).reduce((s, a) => s + a.paymentAmount, 0)
  const unpaid = apps.filter((a) => !a.paymentPaid).reduce((s, a) => s + a.paymentAmount, 0)

  return (
    <PaymentsRender
      apps={apps}
      paidLabel={money(paid)}
      unpaidLabel={money(unpaid)}
      appsBase={`${staffBase(session?.role)}/apps`}
    />
  )
}
