import type { ApplicationStatus } from '@vises/contracts';

/** One append-only history step for a seeded application. */
export type SeedStatusTransition = {
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  actorId: string | null;
  actorRole: string;
  trigger: string | null;
  /** Days after the application base time. */
  dayOffset: number;
};
