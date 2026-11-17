import type { ApplicationStatus } from '@vises/contracts';

/** Inputs for FR-13 monitor remap (draft|filling → not_ready_for_appointment). */
export type AssertMonitorStatusRemapAllowedInput = {
  source: ApplicationStatus;
};
