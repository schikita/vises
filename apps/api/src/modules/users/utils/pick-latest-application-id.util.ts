import { applicationRecencyTime } from './application-recency-time.util';

/**
 * Pick the latest application id by max `updatedAt`, then `createdAt`.
 */
export const pickLatestApplicationId = (
  apps: readonly {
    id: string;
    updatedAt: Date | string;
    createdAt: Date | string;
  }[],
): string | null => {
  if (apps.length === 0) {
    return null;
  }

  let latest = apps[0];
  for (let i = 1; i < apps.length; i += 1) {
    const candidate = apps[i];
    if (candidate === undefined || latest === undefined) {
      continue;
    }
    const latestUpdated = applicationRecencyTime(latest.updatedAt);
    const candidateUpdated = applicationRecencyTime(candidate.updatedAt);
    if (candidateUpdated !== latestUpdated) {
      if (candidateUpdated > latestUpdated) {
        latest = candidate;
      }
      continue;
    }
    if (
      applicationRecencyTime(candidate.createdAt) >
      applicationRecencyTime(latest.createdAt)
    ) {
      latest = candidate;
    }
  }

  return latest?.id ?? null;
};
