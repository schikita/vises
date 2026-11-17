import type { StaffRole } from '@vises/contracts';

/** Minimal user identity used when resolving `latestAppId`. */
export type ResolveLatestAppIdUser = {
  id: string;
  email: string;
  login: string;
  role: StaffRole;
};
