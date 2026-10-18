import type { ApplicationDetailStartIssue } from '../types'
import { splitApplicationDetailStartApiDetail } from './split-application-detail-start-api-detail.util'

/**
 * Map start/supersede API `detail` into Dialog issue lines (DEC-006).
 * No tabId — API residual errors must not auto-switch tabs.
 */
export const mapApplicationDetailStartApiDetailToIssues = (
  detail: string,
): ApplicationDetailStartIssue[] =>
  splitApplicationDetailStartApiDetail(detail).map((message) => ({ message }))
