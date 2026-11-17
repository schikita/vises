import {
  APPLICATION_STATUS_TRANSITION_MATRIX,
  type ApplicationStatus,
  type ApplicationStatusTransition,
} from '@vises/contracts';

/**
 * Look up the §4.C / FR-13 matrix row for source → target.
 */
export const findStatusTransition = (
  source: ApplicationStatus,
  target: ApplicationStatus,
): ApplicationStatusTransition | undefined => {
  return APPLICATION_STATUS_TRANSITION_MATRIX.find(
    (row) => row.source === source && row.target === target,
  );
};
