import { HttpException, HttpStatus } from '@nestjs/common';
import { collectBlsApplicationApplicantDateViolations } from './collect-bls-application-applicant-date-violations.util';
import { formatBlsApplicantDateViolationsDetail } from './format-bls-applicant-date-violations-detail.util';

/**
 * Pre-start gate: reject with HTTP 400 aggregated Russian `{ detail }` when any
 * participating applicant fails Core/Extended date rules (REQ-001 / REQ-002 /
 * DEC-006 / DEC-009). No-op when all pass.
 */
export const assertBlsApplicantDatesForWorkflowStart = (input: {
  applicants: unknown;
  returnDate: string;
}): void => {
  const violations = collectBlsApplicationApplicantDateViolations({
    applicants: input.applicants,
    returnDate: input.returnDate,
  });
  if (violations.length === 0) {
    return;
  }
  throw new HttpException(
    formatBlsApplicantDateViolationsDetail(violations),
    HttpStatus.BAD_REQUEST,
  );
};
