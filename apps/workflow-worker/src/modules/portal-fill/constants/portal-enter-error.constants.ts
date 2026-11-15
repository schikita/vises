/**
 * ENTER_* stuck codes for post-auth home recognition
 * (successful-enter FR-7 / successful_enter_issues.md).
 * Named constants only — no helper functions. No TypeScript enum.
 */

export const PORTAL_ENTER_ERROR_CODE = {
  ENTER_LOGIN_FORM_STILL_VISIBLE: 'ENTER_LOGIN_FORM_STILL_VISIBLE',
  ENTER_HOME_CUES_MISSING: 'ENTER_HOME_CUES_MISSING',
  ENTER_OVERLAY_STUCK: 'ENTER_OVERLAY_STUCK',
  ENTER_SESSION_LOST: 'ENTER_SESSION_LOST',
  ENTER_WRONG_CTA_DOORSTEP: 'ENTER_WRONG_CTA_DOORSTEP',
} as const;

/** Logical stuckPoint tokens embedded in evidence (FR-1 / FR-8). */
export const PORTAL_ENTER_STUCK_POINT = {
  LOGIN: 'LOGIN',
  PASSWORD_CHANGE_PROBE: 'PASSWORD_CHANGE_PROBE',
  AUTHENTICATED_LANDING: 'AUTHENTICATED_LANDING',
  HOME_RECOGNIZED: 'HOME_RECOGNIZED',
  HOME_NOT_READY: 'HOME_NOT_READY',
} as const;

/** Resume hint tokens for ENTER_* evidence bags. */
export const PORTAL_ENTER_RESUME_HINT = {
  RE_LOGIN: 're_login',
  GOTO_HOME_REASSERT: 'goto_home_reassert',
  RELOAD_HOME: 'reload_home',
  RE_QUERY_NEWAPPOINTMENT: 're_query_newappointment',
} as const;
