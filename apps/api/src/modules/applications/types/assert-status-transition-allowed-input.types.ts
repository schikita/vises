import type {
  ApplicationStatus,
  ApplicationStatusTransitionActor,
} from '@vises/contracts';

/** Inputs for FR-7.4 matrix + owning-agent enforcement. */
export type AssertStatusTransitionAllowedInput = {
  source: ApplicationStatus;
  target: ApplicationStatus;
  actor: ApplicationStatusTransitionActor;
  /** Required when `actor === 'agent'` — owning-agent check (FR-7.4). */
  isOwningAgent: boolean;
};
