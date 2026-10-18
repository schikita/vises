import type { Application } from '../../database/entities/application.entity';

/**
 * Pick latest application id for a user identity (parity with
 * `resolveLatestAppIdForUser`: match clientEmail to email/login, prefer
 * greatest updatedAt||createdAt).
 */
export const resolveLatestAppIdForUserIdentity = (
  apps: readonly Application[],
  user: { email: string; login: string },
): string | null => {
  const email = user.email.trim().toLowerCase();
  const login = user.login.trim().toLowerCase();

  const matched = apps.filter((app) => {
    const client = (app.clientEmail ?? '').trim().toLowerCase();
    if (!client) return false;
    return (email && client === email) || (login && client === login);
  });

  if (matched.length === 0) return null;

  let latest = matched[0];
  for (let i = 1; i < matched.length; i += 1) {
    const candidate = matched[i];
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

  return latest.id;
};
