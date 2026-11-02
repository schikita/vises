/** Inputs for building the polite aria-live status announcement (NFR-004). */
export type BlsHttpWorkflowLiveStatusParts = {
  loading: boolean
  error: string
  actionError: string
  empty: boolean
  statusLabel: string | null
  currentStepLabel: string | null
  polling: boolean
}
