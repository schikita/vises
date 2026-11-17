import { apiRequestRaw, extractApiErrorDetail } from '@/shared/api'
import { BLS_WORKFLOW_MSG_NOT_FOUND } from '../constants'
import type { BlsWorkflowSnapshot } from '../types'

/**
 * GET latest workflow snapshot for application.
 * Returns null when no workflow exists (404 «Заполнение не найдено»).
 */
export const fetchBlsWorkflow = async (
  applicationId: string,
): Promise<BlsWorkflowSnapshot | null> => {
  const { status, data, networkError } = await apiRequestRaw<
    BlsWorkflowSnapshot | { detail?: string }
  >(`/apps/${encodeURIComponent(applicationId)}/bls-workflow`)

  if (networkError) {
    throw new Error('Не удалось загрузить заполнение BLS (сеть или таймаут)')
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
      extractApiErrorDetail(data) ?? `Не удалось загрузить заполнение BLS (${status})`,
    )
  }

  return data as BlsWorkflowSnapshot
}
