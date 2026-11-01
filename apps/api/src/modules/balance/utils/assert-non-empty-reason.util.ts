import { throwReasonRequired } from './throw-reason-required.util';

/** Trim and require a non-empty adjust reason (FR-4 / edge 15). */
export const assertNonEmptyReason = (reason: string): string => {
  const trimmed = reason.trim();
  if (trimmed === '') {
    return throwReasonRequired();
  }
  return trimmed;
};
