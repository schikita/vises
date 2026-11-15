/**
 * Authenticated Global home cues / paths (successful-enter FR-2 / FR-4).
 * Named constants only — no helper functions.
 */

/** Default path to authenticated Global home. */
export const DEFAULT_PORTAL_HOME_PATH = '/Global/home/index';

/** Home section heading (exact fixture text). */
export const PORTAL_HOME_VISA_PROCESS_HEADING = 'VISA APPLICATION PROCESS';

/** Secondary-nav Manage Appointments dropdown label. */
export const PORTAL_HOME_MANAGE_APPOINTMENTS_TEXT = 'Manage Appointments';

/** Preferred booking-entry nav CTA label. */
export const PORTAL_HOME_BOOK_NEW_APPOINTMENT_TEXT = 'Book New Appointment';

/** Href substring for appointment booking CTAs (never doorstep). */
export const PORTAL_HOME_NEWAPPOINTMENT_HREF_SUBSTRING = 'newappointment';

/** Href substring that MUST never be used as booking entry. */
export const PORTAL_HOME_DOORSTEP_HREF_SUBSTRING = 'doorstepservice';

/** Wall-clock class wait for home cue recognition (ms). */
export const PORTAL_HOME_RECOGNIZE_WAIT_MS = 30_000;

/** Poll interval while waiting for home cues (ms). */
export const PORTAL_HOME_RECOGNIZE_POLL_MS = 500;
