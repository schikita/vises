import type {
  ApplicationDetailStartIssue,
  ApplicationDetailTabId,
} from '../types'

/**
 * First tab that owns a Start validation error (DEC-007: applicants before trip).
 */
export const resolveApplicationDetailStartFirstTab = (
  issues: ReadonlyArray<ApplicationDetailStartIssue>,
): Extract<ApplicationDetailTabId, 'applicants' | 'trip'> | null => {
  if (issues.some((issue) => issue.tabId === 'applicants')) return 'applicants'
  if (issues.some((issue) => issue.tabId === 'trip')) return 'trip'
  return null
}
