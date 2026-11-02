import type { BlsHttpWorkflowApplicantLabelSource } from '../types'

/** Fallback when applicantId is null/empty and no name is available. */
const APPLICANT_LABEL_FALLBACK = '—'

/**
 * Resolve staff-facing applicant label (DEC-004 / REQ-011).
 * Prefer firstName + lastName from applicants when id matches; else id; else safe fallback.
 */
export const resolveBlsHttpWorkflowApplicantLabel = (
  applicantId: string | null | undefined,
  applicants?: BlsHttpWorkflowApplicantLabelSource[],
): string => {
  const id = typeof applicantId === 'string' ? applicantId.trim() : ''
  if (id === '') return APPLICANT_LABEL_FALLBACK

  const match = applicants?.find((a) => a.id === id)
  if (match == null) return id

  const name = [match.firstName, match.lastName]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter((part) => part !== '')
    .join(' ')

  return name !== '' ? name : id
}
