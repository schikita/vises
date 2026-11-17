import type {
  ApplicationStatus,
  ApplicationStatusTransitionActor,
} from '@vises/contracts';

/** Inputs for §4.C / FR-13 matrix + owning-agent enforcement. */
export type AssertStatusTransitionAllowedInput = {
  source: ApplicationStatus;
  target: ApplicationStatus;
  actor: ApplicationStatusTransitionActor;
  /** Required when `actor === 'agent'` — owning-agent check (§4.C). */
  isOwningAgent: boolean;
};
