import type { ApplicationStatus } from '@vises/contracts';
import {
  VISA_CENTER_MONITOR_ACTOR,
  VISA_CENTER_MONITOR_REMAP_SOURCES,
  VISA_CENTER_MONITOR_REMAP_TARGET,
} from '../constants';
import type { AssertMonitorStatusRemapAllowedInput } from '../types';
import { findStatusTransition } from './find-status-transition.util';
import { throwIllegalTransition } from './throw-illegal-transition.util';

const isMonitorRemapSource = (
  source: ApplicationStatus,
): source is (typeof VISA_CENTER_MONITOR_REMAP_SOURCES)[number] =>
  (VISA_CENTER_MONITOR_REMAP_SOURCES as readonly string[]).includes(source);

/**
 * FR-13 monitor remap: only `draft`|`filling` → `not_ready_for_appointment`.
 * `draft` is matrix-listed for `visa_center_monitor`; `filling` shares the same
 * BUSINESS edge (actors are system/staff) but the retained monitor endpoint may
 * still perform the remap per FR-13 / §6 API table.
 */
export const assertMonitorStatusRemapAllowed = (
  input: AssertMonitorStatusRemapAllowedInput,
): void => {
  if (!isMonitorRemapSource(input.source)) {
    return throwIllegalTransition();
  }

  const row = findStatusTransition(
    input.source,
    VISA_CENTER_MONITOR_REMAP_TARGET,
  );
  if (!row) {
    return throwIllegalTransition();
  }

  if (
    input.source === 'draft' &&
    !(row.actors as readonly string[]).includes(VISA_CENTER_MONITOR_ACTOR)
  ) {
    return throwIllegalTransition();
  }
};
