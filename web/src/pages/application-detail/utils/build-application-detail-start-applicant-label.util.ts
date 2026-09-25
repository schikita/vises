/** Operator-facing applicant identity for Start issue lines (REQ-005). */
export const buildApplicationDetailStartApplicantLabel = (
  applicant: { firstName?: string; lastName?: string } | undefined,
  index: number,
): string => {
  const firstName = applicant?.firstName?.trim() ?? ''
  const lastName = applicant?.lastName?.trim() ?? ''
  const fullName = `${firstName} ${lastName}`.trim()
  if (fullName) return fullName
  return `Заявитель ${index + 1}`
}
