import type { ApplicationStatus } from '@vises/contracts';
import type { Application } from '../../database/entities/application.entity';

/** Inputs for mutable status update + history append in one transaction. */
export type ApplyStatusTransitionInput = {
  application: Application;
  targetStatus: ApplicationStatus;
  actorId: string | null;
  actorRole: string;
  trigger: string | null;
};
