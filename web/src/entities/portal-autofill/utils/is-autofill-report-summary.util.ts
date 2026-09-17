import type { AutofillReportSummary } from '../types'

export const isAutofillReportSummary = (body: unknown): body is AutofillReportSummary =>
  Boolean(
    body &&
      typeof body === 'object' &&
      'ok' in body &&
      typeof (body as AutofillReportSummary).ok === 'boolean' &&
      'applicationId' in body &&
      'applicantId' in body,
  )
