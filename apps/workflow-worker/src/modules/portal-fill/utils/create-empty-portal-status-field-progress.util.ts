import type { PortalStatusFieldProgress } from '../types/portal-status-checkpoint.types';

/** Empty field-progress bag (ids only). */
export const createEmptyPortalStatusFieldProgress =
  (): PortalStatusFieldProgress => ({
    filled: [],
    skipped: [],
    failed: [],
  });
