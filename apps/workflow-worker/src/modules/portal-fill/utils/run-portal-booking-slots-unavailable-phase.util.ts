import { Logger } from '@nestjs/common';
import {
  PORTAL_BOOKING_CHECKPOINT_OUTCOME,
  PORTAL_BOOKING_CHECKPOINT_STEP,
  PORTAL_BOOKING_CHECKPOINT_STUCK_CODE,
  PORTAL_BOOKING_SLOTS_UNAVAILABLE_ERROR_CODE,
} from '../constants';
import type {
  RunPortalBookingSlotsUnavailablePhaseOptions,
  RunPortalBookingSlotsUnavailablePhaseResult,
} from '../types/portal-booking-slots-unavailable.types';
import { clickPortalBookingTryAgain } from './click-portal-booking-try-again.util';
import { probePortalBookingSlotsUnavailable } from './probe-portal-booking-slots-unavailable.util';
import { waitForPortalBookingSelectionUi } from './wait-for-portal-booking-selection-ui.util';

const logger = new Logger('runPortalBookingSlotsUnavailablePhase');

/**
 * After captcha: probe exact slots-unavailable banner; when present persist
 * `SLOTS_UNAVAILABLE` / `BOOK_SLOTS_UNAVAILABLE`, click Try Again, wait for
 * booking selection UI, then return SAFE_TO_REPEAT failure for runner backoff
 * (REQ-014…015 / NFR-001 / DEC-008 / OQ-002 / VT-TASK-009).
 * Absence → `ok: true`, `slotsUnavailable: false` (caller → UNKNOWN_NEXT
 * staff terminal; DEC-004 / OQ-007). No calendar path (REQ-017).
 */
export const runPortalBookingSlotsUnavailablePhase = async (
  options: RunPortalBookingSlotsUnavailablePhaseOptions,
): Promise<RunPortalBookingSlotsUnavailablePhaseResult> => {
  const logPrefix = options.logPrefix ?? 'portal-booking-slots';
  const notes: string[] = [];

  logger.log(`${logPrefix} phase=slots_probe start`);
  const probe = await probePortalBookingSlotsUnavailable(options.page);
  if (!probe.present) {
    notes.push('booking_slots_unavailable_absent');
    logger.log(`${logPrefix} phase=slots_probe absent continuing`);
    return { ok: true, slotsUnavailable: false, notes };
  }

  notes.push('booking_slots_unavailable_present');
  logger.log(`${logPrefix} phase=slots_probe present`);

  if (options.onCheckpoint) {
    await options.onCheckpoint({
      lastCompletedStep: PORTAL_BOOKING_CHECKPOINT_STEP.SLOTS_UNAVAILABLE,
      lastOutcome: PORTAL_BOOKING_CHECKPOINT_OUTCOME.SLOTS_UNAVAILABLE,
      stuckCode: PORTAL_BOOKING_CHECKPOINT_STUCK_CODE.BOOK_SLOTS_UNAVAILABLE,
    });
  }

  logger.log(`${logPrefix} phase=slots_try_again start`);
  const tryAgain = await clickPortalBookingTryAgain(options.page);
  if (!tryAgain.ok) {
    const error = tryAgain.error;
    logger.error(`${logPrefix} phase=slots_try_again failure ${error}`);
    notes.push(error);
    return {
      ok: false,
      slotsUnavailable: true,
      tryAgainOk: false,
      error,
      errorCode: PORTAL_BOOKING_SLOTS_UNAVAILABLE_ERROR_CODE,
      notes,
    };
  }
  notes.push(`slots_try_again via=${tryAgain.via}`);
  logger.log(`${logPrefix} phase=slots_try_again success via=${tryAgain.via}`);

  const bookingReady = await waitForPortalBookingSelectionUi(options.page);
  if (!bookingReady.ok) {
    const error = bookingReady.error;
    logger.error(
      `${logPrefix} phase=slots_selection_ui failure ${error}`,
    );
    notes.push(error);
    return {
      ok: false,
      slotsUnavailable: true,
      tryAgainOk: false,
      error,
      errorCode: PORTAL_BOOKING_SLOTS_UNAVAILABLE_ERROR_CODE,
      notes,
    };
  }
  notes.push('booking_selection_ui_open_after_try_again');
  logger.log(`${logPrefix} phase=slots_selection_ui success`);

  if (options.onCheckpoint) {
    await options.onCheckpoint({
      lastCompletedStep: PORTAL_BOOKING_CHECKPOINT_STEP.BOOKING_UI_OPEN,
      lastOutcome: PORTAL_BOOKING_CHECKPOINT_OUTCOME.SLOTS_UNAVAILABLE,
      stuckCode: PORTAL_BOOKING_CHECKPOINT_STUCK_CODE.BOOK_SLOTS_UNAVAILABLE,
    });
  }

  const error =
    'Appointment slots are not available — Try Again completed; SAFE_TO_REPEAT backoff (DEC-008 / NFR-001)';
  notes.push('slots_unavailable_safe_to_repeat');
  logger.warn(`${logPrefix} phase=slots_unavailable safe_to_repeat`);

  return {
    ok: false,
    slotsUnavailable: true,
    tryAgainOk: true,
    error,
    errorCode: PORTAL_BOOKING_SLOTS_UNAVAILABLE_ERROR_CODE,
    notes,
  };
};
