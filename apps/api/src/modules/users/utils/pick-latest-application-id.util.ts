import type { Application } from '../../database/entities/application.entity';

/** Prefer greatest `updatedAt||createdAt` ISO key; return that application id. */
export const pickLatestApplicationId = (
  apps: readonly Application[],
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
    const latestKey = (
      latest.updatedAt?.toISOString?.() ??
      latest.createdAt?.toISOString?.() ??
      ''
    ).toString();
    const candidateKey = (
      candidate.updatedAt?.toISOString?.() ??
      candidate.createdAt?.toISOString?.() ??
      ''
    ).toString();
    if (candidateKey.localeCompare(latestKey) > 0) {
      latest = candidate;
    }
  }

  return latest?.id ?? null;
};
