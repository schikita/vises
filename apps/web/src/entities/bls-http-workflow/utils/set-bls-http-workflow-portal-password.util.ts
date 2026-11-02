import { apiRequest } from '@/shared/api'

/**
 * PUT staff-entered portal password for an application whose portal account
 * exists but its secret is not in the vault (registered outside the engines).
 * Enables the reuse path (one portal account per passport).
 */
export const setBlsHttpWorkflowPortalPassword = (
  applicationId: string,
  portalPassword: string,
): Promise<{ ok: true }> =>
  apiRequest<{ ok: true }>(
    `/apps/${encodeURIComponent(applicationId)}/bls-http-workflow/portal-credentials`,
    { method: 'PUT', data: { portalPassword } },
  )
