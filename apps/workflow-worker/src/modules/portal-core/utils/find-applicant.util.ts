import type { ApplicantInput, ApplicationInput } from '../types';

export const findApplicant = (
  application: ApplicationInput,
  applicantId: string,
): ApplicantInput | undefined => {
  const list = application.applicants ?? [];
  return list.find((a) => String(a.id) === applicantId);
};
