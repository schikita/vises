/**
 * Kendo DatePicker calendar UI fallback selectors / stale defaults (DEC-017).
 * Selector strings only — no named helper functions (DEC-008).
 */

/** Portal stale DatePicker default that Must fail closed (REQ-008 / REQ-011). */
export const PORTAL_DATEPICKER_STALE_DEFAULT_YMD = '0001-01-01';

/** RegisterUser Server* companions mirrored from OnSubmit widget.value() (DEC-015). */
export const PORTAL_DATEPICKER_SERVER_FIELD_IDS = [
  'ServerDateOfBirth',
  'ServerPassportIssueDate',
  'ServerPassportExpiryDate',
] as const;

/** Calendar open control inside `.k-datepicker` chrome. */
export const PORTAL_DATEPICKER_CALENDAR_SELECT_SELECTOR = '.k-select';

/** Host wrappers for RegisterUser datepickers. */
export const PORTAL_DATEPICKER_WIDGET_HOST_SELECTOR =
  '.k-widget.k-datepicker, .k-datepicker';

/** Dateview popup root id pattern: `${fieldName}_dateview` (aria-owns). */
export const PORTAL_DATEPICKER_DATEVIEW_ID_SUFFIX = '_dateview';

/** Title / “fast nav” control (month → year → decade). */
export const PORTAL_DATEPICKER_DATEVIEW_NAV_FAST_SELECTOR =
  '.k-nav-fast, .k-calendar-nav-fast, a.k-link.k-nav-fast';

export const PORTAL_DATEPICKER_DATEVIEW_NAV_PREV_SELECTOR =
  '.k-nav-prev, .k-calendar-nav-prev, a.k-link.k-nav-prev';

export const PORTAL_DATEPICKER_DATEVIEW_NAV_NEXT_SELECTOR =
  '.k-nav-next, .k-calendar-nav-next, a.k-link.k-nav-next';

/** Year / month cells in decade or year views. */
export const PORTAL_DATEPICKER_DATEVIEW_PERIOD_CELL_SELECTOR =
  'td.k-meta-view:not(.k-other-month), td[role="gridcell"].k-meta-view, .k-calendar-view td:not(.k-other-month), td.k-state-default:not(.k-other-month)';

/** Day cells in month view (exclude other-month duplicates). */
export const PORTAL_DATEPICKER_DATEVIEW_DAY_CELL_SELECTOR =
  'td[role="gridcell"]:not(.k-other-month), td.k-state-default:not(.k-other-month)';

/** Max title/nav iterations before fail-closed. */
export const PORTAL_DATEPICKER_CALENDAR_NAV_MAX_STEPS = 24;
