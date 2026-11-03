import type { Application } from '../../database/entities/application.entity';
import { pickLatestApplicationId } from './pick-latest-application-id.util';

/**
 * Pick latest application id for a user identity (parity with
 * `resolveLatestAppIdForUser`: match clientEmail to email/login, prefer
 * greatest updatedAt||createdAt). Used for non-agent staff (DEC-P6).
 */
export const resolveLatestAppIdForUserIdentity = (
  apps: readonly Application[],
  user: { email: string; login: string },
): string | null => {
  const email = user.email.trim().toLowerCase();
  const login = user.login.trim().toLowerCase();

  const matched = apps.filter((app): boolean => {
    const client = (app.clientEmail ?? '').trim().toLowerCase();
    if (!client) {
      return false;
    }
    const emailMatch = Boolean(email) && client === email;
    const loginMatch = Boolean(login) && client === login;
    return emailMatch || loginMatch;
  });

  return pickLatestApplicationId(matched);
};
