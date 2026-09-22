/**
 * Booking / VisaType selection cues aligned with fixtures
 * `ready_book_status.html`, `slect_location_visa_type.html`,
 * `book_new_appointment.html` (REQ-020 / REQ-030 / CON-006 / TASK-012).
 * Named constants only — no helper functions.
 */

/** Default path to new-appointment booking UI. */
export const DEFAULT_NEW_APPOINTMENT_PATH =
  '/Global/appointment/newappointment';

export const PORTAL_BOOKING_SELECTORS = {
  /** Manage Applicants CTA (`ready_book_status.html`). */
  bookNewAppointmentLinkText: 'Book New Appointment',
  bookNewAppointmentHrefSubstring: 'newappointment',
  /** Location/visa modal (`slect_location_visa_type.html`). */
  locationVisaModalId: 'visaTypeModal',
  locationVisaModalTitleText: 'Select Your Location & Visa Type',
  locationLabelText: 'Location',
  visaTypeLabelText: 'Visa Type',
  appointmentForLabelText: 'Appointment For',
  individualRadioValue: 'Individual',
  familyRadioValue: 'Family',
  /** Page heading (`book_new_appointment.html`). */
  visaTypeSelectionHeading: 'Book New Appointment - Visa Type Selection',
  /** Form action on VisaType selection page. */
  visaTypeFormActionSubstring: '/Global/Appointment/VisaType',
  /** Modal Location/VisaType hidden inputs (`slect_location_visa_type.html`). */
  modalLocationInputId: 'LocationId',
  modalVisaTypeInputId: 'VisaType',
  /**
   * CON-006 hard-stop — Must never automate these.
   * Kept as named cues for guards / reviews (do not click).
   */
  visaTypeSubmitButtonId: 'btnSubmit',
  onSubmitVisaTypeFn: 'OnSubmitVisaType',
  premiumLoungeModalId: 'PremiumTypeModel',
  payConfirmModalLabelId: 'payConfirmModalLabel',
  premiumLoungeAcceptText: 'Accept',
  premiumLoungeRejectText: 'Reject',
} as const;

/** Wait for booking selection UI after opening Book New Appointment. */
export const PORTAL_BOOKING_PAGE_WAIT_MS = 30_000;

/** Poll interval while waiting for booking selection cues. */
export const PORTAL_BOOKING_POLL_MS = 500;
