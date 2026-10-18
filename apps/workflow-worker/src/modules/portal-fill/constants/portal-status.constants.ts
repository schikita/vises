/**
 * Applicant status / manage-applicants cues aligned with fixtures
 * `applicant_details.html`, `ready_book_status.html`, `edit_app.html`,
 * `modal_attention_app_editing.html` (REQ-018 / REQ-019 / TASK-011).
 * Named constants only — no helper functions.
 */

/** Re-export manage-applicants path default (owned by portal-core config). */
export { DEFAULT_MANAGE_APPLICANTS_PATH } from '../../portal-core/constants/portal-config.defaults.constants';

/**
 * On-disk portal status label spellings → normalized enum (DEC-008).
 * Keys are lowercase collapsed whitespace for matching.
 */
export const PORTAL_APPLICANT_STATUS_LABELS = {
  FORM_FILLING_IN_PROGRESS: 'Form Filling In-Progress',
  READY_TO_BOOK: 'Ready To Book Appointment',
} as const;

export const PORTAL_STATUS_SELECTORS = {
  /** Manage Applicants page heading. */
  manageApplicantsHeading: 'Manage Applicants',
  /** Applicant list section heading. */
  applicantDetailsHeading: 'Applicant Details',
  /** Row status label prefix (mobile cue). */
  statusLabelPrefix: 'Status:',
  /** Edit action title from fixtures. */
  editActionTitle: 'Edit/Complete Applicant Details',
  /** ManageApplicant onclick name. */
  manageApplicantFn: 'ManageApplicant',
  /** Edit form action substring (`/Global/AppointmentData/ManageApplicant`). */
  editFormActionSubstring: 'ManageApplicant',
  /** Edit form `#myForm` id. */
  editFormId: 'myForm',
  editSubmitButtonText: 'Submit',
  /** Attention modal (`modal_attention_app_editing.html`). */
  attentionModalId: 'scamAlert',
  attentionTitleText: 'Attention',
  attentionAcceptButtonText: 'Accept',
  /** Simple text fields we may fill when empty on edit form. */
  firstNameName: 'FirstName',
  lastNameName: 'LastName',
  surNameName: 'SurName',
  placeOfBirthName: 'PlaceOfBirth',
  passportNoName: 'PassportNo',
} as const;

/** Wait for manage-applicants / status cues after navigation. */
export const PORTAL_STATUS_PAGE_WAIT_MS = 30_000;

/** Wait after edit submit before re-scrape. */
export const PORTAL_STATUS_EDIT_SETTLE_MS = 3_000;

/** Poll interval while waiting for status page cues. */
export const PORTAL_STATUS_POLL_MS = 500;
