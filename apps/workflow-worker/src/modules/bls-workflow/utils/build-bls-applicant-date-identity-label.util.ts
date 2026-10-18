import type { BlsApplicantDateFields } from '../types/bls-applicant-date.types';

/**
 * Operator-facing applicant identity: `Фамилия Имя (id)` or `id` when name blank
 * (DEC-005 / REQ-002).
 */
export const buildBlsApplicantDateIdentityLabel = (
  applicant: Pick<BlsApplicantDateFields, 'id' | 'firstName' | 'lastName'>,
): string => {
  const last = String(applicant.lastName ?? '').trim();
  const first = String(applicant.firstName ?? '').trim();
  const name = [last, first].filter((part) => part.length > 0).join(' ');
  const id = String(applicant.id).trim();
  if (name.length > 0) {
    return `${name} (${id})`;
  }
  return id;
};
