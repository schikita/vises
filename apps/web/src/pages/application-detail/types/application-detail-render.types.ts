import type { ReactNode } from 'react'
import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import type { Application, DocType } from '@/entities/application'
import type {
  BeforeStartBlsWorkflow,
  OnStartBlsWorkflowApiError,
} from '@/widgets/bls-workflow-panel'
import type { ApplicationDetailStartIssue } from './bls-start-validation.types'
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
  /** Delete control — admin|superadmin only (REQ-014 / AC-011). */
  canDeleteApplication: boolean
  /** «Оплата и документы» tab — admin|superadmin only (REQ-016 / AC-012). */
  canAccessPaymentTab: boolean
  startValidationOpen: boolean
  startValidationIssues: ApplicationDetailStartIssue[]
  /** Detail-owned Start disable signal for BLS panel (DEC-003). */
  startFormBlocked: boolean
  /** Portal one-page form region (PF-TASK-006). */
  portalPanel: ReactNode
  register: UseFormRegister<Application>
  setValue: UseFormSetValue<Application>
  watch: UseFormWatch<Application>
  onTabChange: (tab: ApplicationDetailTabId) => void
  onCloseStartValidation: () => void
  onStartRelevantBlur: (fieldName: string) => void
  onStartRelevantChange: (fieldName: string) => void
  onBeforeStartBlsWorkflow: BeforeStartBlsWorkflow
  onStartBlsWorkflowApiError: OnStartBlsWorkflowApiError
  onSave: () => void
  onRemove: () => void
  onUpload: (type: DocType, file: File) => void
  onOpenDoc: (docId: string) => void
  /** Opens RegisterUser screenshot for AUTOFILL_RUN_LINKED (DEC-007). */
  onAutofillRunLinked: (runId: string) => void | Promise<void>
}
