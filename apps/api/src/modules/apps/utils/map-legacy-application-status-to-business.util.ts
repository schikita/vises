import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from '@vises/contracts';
import { LEGACY_APPLICATION_STATUS_TO_BUSINESS } from './map-legacy-application-status-to-business.constants';
import type { LegacyApplicationStatus } from './map-legacy-application-status-to-business.types';

const BUSINESS_STATUS_SET: ReadonlySet<string> = new Set(APPLICATION_STATUSES);

/**
 * Map a persisted application/history status literal to BUSINESS (§4.D / ASAU-004).
 * Already-BUSINESS → identity. Unknown non-BUSINESS → throws.
 */
export const mapLegacyApplicationStatusToBusiness = (
  status: string,
): ApplicationStatus => {
  if (BUSINESS_STATUS_SET.has(status)) {
    return status as ApplicationStatus;
  }

  const mapped =
    LEGACY_APPLICATION_STATUS_TO_BUSINESS[status as LegacyApplicationStatus];
  if (mapped === undefined) {
    throw new Error(
      `Unknown non-BUSINESS application status literal: ${JSON.stringify(status)}`,
    );
  }

  return mapped;
};
