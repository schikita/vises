import { BLS_APPLICANT_COMPLETENESS_DETAIL_SEPARATOR } from '../constants/bls-applicant-completeness.constants';
import type {
  BlsWorkflowStartGateResult,
  EvaluateBlsWorkflowStartGateInput,
} from '../types/bls-workflow-start-gate.types';
import { collectBlsApplicationApplicantCompletenessViolations } from './collect-bls-application-applicant-completeness-violations.util';
import { collectBlsApplicationApplicantDateViolations } from './collect-bls-application-applicant-date-violations.util';
import { formatBlsApplicantCompletenessViolationsDetail } from './format-bls-applicant-completeness-violations-detail.util';
import { formatBlsApplicantDateViolationsDetail } from './format-bls-applicant-date-violations-detail.util';

/**
 * Pure Start Completeness + Core/Extended date gate (DEC-001 / REQ-001).
 * Does not mutate applications or throw — callers apply needs-fixes + HTTP 400.
 */
export const evaluateBlsWorkflowStartGate = (
  input: EvaluateBlsWorkflowStartGateInput,
): BlsWorkflowStartGateResult => {
  const completenessViolations =
    collectBlsApplicationApplicantCompletenessViolations({
      applicants: input.applicants,
      clientEmail: input.clientEmail,
    });
  const dateViolations = collectBlsApplicationApplicantDateViolations({
    applicants: input.applicants,
    returnDate: input.returnDate,
    referenceDateYmd: input.referenceDateYmd,
  });

  if (
    completenessViolations.length === 0 &&
    dateViolations.length === 0
  ) {
    return { ok: true };
  }

  const detailParts = [
    formatBlsApplicantCompletenessViolationsDetail(completenessViolations),
    formatBlsApplicantDateViolationsDetail(dateViolations),
  ].filter((part) => part.length > 0);

  return {
    ok: false,
    detail: detailParts.join(BLS_APPLICANT_COMPLETENESS_DETAIL_SEPARATOR),
  };
};
