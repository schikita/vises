import type { FormEvent } from 'react'
import type {
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form'
import type { ClientListDto } from '@/entities/client'
import type { IssuedAccess } from '@/entities/user'
import type { PortalOnePageFormValues } from '@/features/application-form'

export type StaffCreateApplicationRenderProps = {
  saving: boolean
  error: string
  issued: IssuedAccess | null
  createdAppId: string | null
  copied: boolean
  staffAppsBase: string
  clients: ClientListDto[]
  clientsLoading: boolean
  clientsError: string
  selectedClientId: string
  register: UseFormRegister<PortalOnePageFormValues>
  errors: FieldErrors<PortalOnePageFormValues>
  onSelectedClientIdChange: (clientId: string) => void
  onSubmit: (e: FormEvent) => void
  onBack: () => void
  onCopyLink: (token: string) => void
  onCopyAll: () => void
  onGoToCreatedApp: () => void
}
