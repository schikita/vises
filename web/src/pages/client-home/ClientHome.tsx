import { useStore } from '@/app/providers'
import { ClientHomeRender } from './ClientHomeRender'

export const ClientHome = () => {
  const { session, apps } = useStore()
  const mine = apps.filter(
    (a) => a.clientEmail === session?.email || a.clientEmail === session?.login,
  )

  return <ClientHomeRender sessionName={session?.name} apps={mine} />
}
