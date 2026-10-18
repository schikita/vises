/** Empty applicants keep Start / supersede Start blocked (REQ-008). */
export const isApplicationDetailApplicantsEmpty = (
  applicants: ReadonlyArray<unknown> | null | undefined,
): boolean => (applicants?.length ?? 0) === 0
