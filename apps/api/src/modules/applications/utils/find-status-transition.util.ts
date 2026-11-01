import {
  APPLICATION_STATUS_TRANSITION_MATRIX,
  type ApplicationStatus,
  type ApplicationStatusTransition,
} from '@vises/contracts';

/**
 * Look up the FR-7.4 matrix row for source → target (AC-12 / AC-14).
 */
export const findStatusTransition = (
  source: ApplicationStatus,
  target: ApplicationStatus,
): ApplicationStatusTransition | undefined => {
  return APPLICATION_STATUS_TRANSITION_MATRIX.find(
    (row) => row.source === source && row.target === target,
  );
};
