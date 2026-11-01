import type { ApplicationStatusTransitionActor } from '@vises/contracts';
import type { AssertStatusTransitionAllowedInput } from '../types';
import { findStatusTransition } from './find-status-transition.util';
import { throwForbiddenRole } from './throw-forbidden-role.util';
import { throwIllegalTransition } from './throw-illegal-transition.util';

/**
 * Enforce FR-7.4 matrix + owning-agent rule (AC-12 / AC-14).
 * Missing matrix row or disallowed actor → `illegal_transition`.
 * Agent listed on matrix but not owner → `forbidden_role`.
 */
export const assertStatusTransitionAllowed = (
  input: AssertStatusTransitionAllowedInput,
): void => {
  const row = findStatusTransition(input.source, input.target);
  if (!row) {
    return throwIllegalTransition();
  }

  const actors: readonly ApplicationStatusTransitionActor[] = row.actors;
  if (!actors.includes(input.actor)) {
    return throwIllegalTransition();
  }

  if (input.actor === 'agent' && !input.isOwningAgent) {
    return throwForbiddenRole();
  }
};
