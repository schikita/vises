import { apiRequestRaw, extractApiErrorDetail } from '@/shared/api'
import { BLS_WORKFLOW_MSG_NOT_FOUND } from '../constants'
import type { BlsHttpWorkflowSnapshot } from '../types'

/**
 * GET latest workflow snapshot for application.
 * Returns null when no workflow exists (404 «Сценарий не найден»).
 */
export const fetchBlsHttpWorkflow = async (
  applicationId: string,
): Promise<BlsHttpWorkflowSnapshot | null> => {
  const { status, data, networkError } = await apiRequestRaw<
    BlsHttpWorkflowSnapshot | { detail?: string }
  >(`/apps/${encodeURIComponent(applicationId)}/bls-http-workflow`)

  if (networkError) {
    throw new Error('Не удалось загрузить сценарий BLS (сеть или таймаут)')
  }

  if (status === 404) {
    const detail = extractApiErrorDetail(data)
    if (detail === BLS_WORKFLOW_MSG_NOT_FOUND || detail == null) {
      return null
    }
    throw new Error(detail)
  }

  if (status < 200 || status >= 300) {
    throw new Error(
      extractApiErrorDetail(data) ?? `Не удалось загрузить сценарий BLS (${status})`,
    )
  }

  return data as BlsHttpWorkflowSnapshot
}
