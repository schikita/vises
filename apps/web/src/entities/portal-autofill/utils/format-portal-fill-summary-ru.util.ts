import type { PortalFieldProgressSummary } from '../types'

/** Short Russian aggregate fill summary for client/staff display (REQ-004). */
export const formatPortalFillSummaryRu = (
  summary: PortalFieldProgressSummary,
): string =>
  `Заполнено: ${summary.filled}, пропущено: ${summary.skipped}, ошибок: ${summary.failed}`
