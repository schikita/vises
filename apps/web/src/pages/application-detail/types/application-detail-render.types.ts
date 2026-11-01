import type { ReactNode } from 'react'
import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import type { Application, DocType } from '@/entities/application'
import type { ApplicationDetailTabId } from './application-detail-tabs.types'

export type ApplicationDetailRenderProps = {
  form: Application | null
  loading: boolean
  saved: boolean
  saveError: string
  uploading: DocType | null
  docError: string
  destinations: string[]
  cities: string[]
  managerNames: string[]
  appsListPath: string
  activeTab: ApplicationDetailTabId
  statusChangeControls: ReactNode
  historyTimeline: ReactNode
  clientPassportLink: ReactNode
  register: UseFormRegister<Application>
  setValue: UseFormSetValue<Application>
  watch: UseFormWatch<Application>
  onTabChange: (tab: ApplicationDetailTabId) => void
  onSave: () => void
  onRemove: () => void
  onUpload: (type: DocType, file: File) => void
  onOpenDoc: (docId: string) => void
}
