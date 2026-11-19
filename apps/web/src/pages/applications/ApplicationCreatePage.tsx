import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UpsertAppResult } from '@/entities/application'
import { ApplicationCreate } from '@/features/application-create'
import { useStore } from '@/widgets/app-store'

/**
 * Staff create at `/admin/apps/new`.
 * Creates a blank application, then opens the portal form for that client.
 * Applicant email is entered on the portal form, not before it.
 */
export const ApplicationCreatePage = (): React.ReactElement => {
  const navigate = useNavigate()
  const { upsert } = useStore()

  const onCreated = useCallback(
    (result: UpsertAppResult): void => {
      const clientId = result.clientId?.trim() ?? ''
      if (clientId.length === 0) {
        return
      }
      void navigate(`/admin/clients/${clientId}/portal-form`)
    },
    [navigate],
  )

  return <ApplicationCreate upsert={upsert} onCreated={onCreated} />
}
