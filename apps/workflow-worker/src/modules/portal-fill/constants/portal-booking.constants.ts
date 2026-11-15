/**
 * Booking / VisaType selection cues aligned with fixtures
 * `ready_book_status.html`, `book_new_appointment.html`,
 * `slots-not-available.html`, `book-appoinntment-captcha.html`
 * (REQ-008…010 / CON-006 / CON-008 / VT-TASK-004).
 * Named constants only — no helper functions.
 */

/** Default path to new-appointment booking UI. */
export const DEFAULT_NEW_APPOINTMENT_PATH =
  '/Global/appointment/newappointment';

export const PORTAL_BOOKING_SELECTORS = {
  /** Manage Applicants CTA (`ready_book_status.html`). */
  bookNewAppointmentLinkText: 'Book New Appointment',
  bookNewAppointmentHrefSubstring: 'newappointment',
  /**
   * Manage Applicants location/visa modal — **not** Visa Type Selection
   * (CON-008). Kept for negative identification / docs only; booking wait
   * must prefer `visaTypeSelectionHeading` + `visaTypeFormActionSubstring`.
   */
  locationVisaModalId: 'visaTypeModal',
  locationVisaModalTitleText: 'Select Your Location & Visa Type',
  modalLocationInputId: 'LocationId',
  modalVisaTypeInputId: 'VisaType',
  /** Full-page Visa Type Selection labels (`book_new_appointment.html`). */
  locationLabelText: 'Location',
  visaTypeLabelText: 'Visa Type',
  visaSubTypeLabelText: 'Visa Sub Type',
  appointmentForLabelText: 'Appointment For',
  numberOfMembersLabelText: 'Number Of Members',
  categoryLabelText: 'Category',
  individualRadioValue: 'Individual',
  familyRadioValue: 'Family',
  /** Page heading — primary booking ready cue (CON-008). */
  visaTypeSelectionHeading: 'Book New Appointment - Visa Type Selection',
  /** Form action — primary booking ready cue (CON-008). */
  visaTypeFormActionSubstring: '/Global/Appointment/VisaType',
  /** Family Appointment modal (`#familyDisclaimer`) — Accept allowed. */
  familyDisclaimerModalId: 'familyDisclaimer',
  familyModalTitleText: 'Family Appointment',
  familyAcceptButtonText: 'Accept',
  familyRejectButtonText: 'Reject',
  /** Slots unavailable (`slots-not-available.html`). */
  slotsUnavailableBannerText: 'Appointment slots are not available',
  slotsUnavailableContainerId: 'div-main',
  tryAgainLinkText: 'Try Again',
  tryAgainHrefSubstring: 'newappointment',
  /** Inline booking captcha roots (`book-appoinntment-captcha.html`). */
  captchaMainDivId: 'captcha-main-div',
  captchaDivClass: 'captcha-div',
  captchaChallengeRootClass: 'main-div-container',
  captchaVerifyButtonId: 'btnVerify',
  /**
   * VisaType Submit — allowlisted click target (DEC-001 / CON-005 /
   * VT-TASK-007). `#btnSubmit` onclick invokes `OnSubmitVisaType`.
   */
  visaTypeSubmitButtonId: 'btnSubmit',
  onSubmitVisaTypeFn: 'OnSubmitVisaType',
  /**
   * Hard-stop forbid cues — detection only; never Accept / confirm
   * (CON-004 / this feature CON-006 / DEC-001).
   */
  premiumLoungeModalId: 'PremiumTypeModel',
  payConfirmModalLabelId: 'payConfirmModalLabel',
  premiumCategoryConfirmationTitleText: 'Premium Category Confirmation',
  premiumLoungeAcceptText: 'Accept',
  premiumLoungeRejectText: 'Reject',
} as const;

/** Wait for booking selection UI after opening Book New Appointment. */
export const PORTAL_BOOKING_PAGE_WAIT_MS = 30_000;

/** Poll interval while waiting for booking selection cues. */
export const PORTAL_BOOKING_POLL_MS = 500;

/**
 * Post-Submit window to probe for booking captcha surface
 * (`book-appoinntment-captcha.html` / REQ-013). Absence is not a failure.
 */
export const PORTAL_BOOKING_CAPTCHA_PROBE_MS = 10_000;
