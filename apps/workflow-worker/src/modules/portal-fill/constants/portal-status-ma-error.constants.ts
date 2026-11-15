/**
 * Proposed MA_* stuck codes for Manage Applicants / Edit Member
 * (`stuck_state_db_contract.md` §3.3). Prefer existing `bls_status_*` when
 * they already cover the failure. Named constants only — no helpers, no enum.
 */

export const PORTAL_STATUS_MA_ERROR_CODE = {
  MA_PAGE_NOT_READY: 'MA_PAGE_NOT_READY',
  MA_APPLICANT_ROW_MISSING: 'MA_APPLICANT_ROW_MISSING',
  MA_VISA_TYPE_MODAL_MISSING: 'MA_VISA_TYPE_MODAL_MISSING',
  MA_LOCATION_VISA_EMPTY: 'MA_LOCATION_VISA_EMPTY',
  MA_IFRAME_NOT_READY: 'MA_IFRAME_NOT_READY',
  MA_ATTENTION_STUCK: 'MA_ATTENTION_STUCK',
  MA_VALIDATION_SUMMARY: 'MA_VALIDATION_SUMMARY',
  MA_DATEPICKER_FAIL: 'MA_DATEPICKER_FAIL',
  MA_BOOK_CTA_MISSING: 'MA_BOOK_CTA_MISSING',
} as const;

/** Resume hint tokens for MA_* evidence bags (stuck contract §1). */
export const PORTAL_STATUS_MA_RESUME_HINT = {
  RETRY_PAGE: 'retry_page',
  STATUS_SCRAPED: 'rescrape',
  OPEN_EDIT: 'open_edit',
  REOPEN_MODAL: 're_open_modal',
  PROCEED_OR_REEDIT: 'proceed_or_reedit',
  REOPEN_EDIT: 're_open_edit',
  FORM_FILLING: 'form_filling',
  CALENDAR_PATH: 'calendar_path',
  BOOKING_ENTRY: 'booking_entry',
} as const;
