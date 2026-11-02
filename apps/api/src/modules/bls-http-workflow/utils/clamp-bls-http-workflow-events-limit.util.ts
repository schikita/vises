import {
  BLS_WORKFLOW_EVENTS_DEFAULT_LIMIT,
  BLS_WORKFLOW_EVENTS_MAX_LIMIT,
} from '../constants/bls-http-workflow.constants';

/**
 * Parse optional `limit` query and clamp to event poll bounds.
 * Invalid / missing → default.
 */
export const clampBlsHttpWorkflowEventsLimit = (
  raw: string | undefined,
): number => {
  if (raw === undefined || raw.trim() === '') {
    return BLS_WORKFLOW_EVENTS_DEFAULT_LIMIT;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return BLS_WORKFLOW_EVENTS_DEFAULT_LIMIT;
  }
  return Math.min(Math.floor(parsed), BLS_WORKFLOW_EVENTS_MAX_LIMIT);
};
