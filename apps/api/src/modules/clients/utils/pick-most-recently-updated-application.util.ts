import type { Application } from '../../database/entities/application.entity';

/**
 * When a Client has multiple Applications (DEC-PF-011 1:N), prefer the
 * most recently updated row for list/detail status display.
 */
export const pickMostRecentlyUpdatedApplication = (
  current: Application | undefined,
  candidate: Application,
): Application => {
  if (!current) {
    return candidate;
  }
  const currentTs = current.updatedAt?.getTime?.() ?? 0;
  const candidateTs = candidate.updatedAt?.getTime?.() ?? 0;
  return candidateTs >= currentTs ? candidate : current;
};
