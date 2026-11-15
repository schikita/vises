/**
 * SITE_* HTTP / WAF stuck codes + recognition strings + resume hints
 * (successful-enter FR-6 / http-and-waf-blocks.md).
 * Named constants only — no helper functions. No TypeScript enum.
 */

export const PORTAL_SITE_HTTP_ERROR_CODE = {
  SITE_APP_TEMPORARILY_UNAVAILABLE: 'SITE_APP_TEMPORARILY_UNAVAILABLE',
  SITE_HTTP_504_GATEWAY_TIMEOUT: 'SITE_HTTP_504_GATEWAY_TIMEOUT',
  SITE_HTTP_403_PLAIN: 'SITE_HTTP_403_PLAIN',
  SITE_HTTP_429_TOO_MANY_REQUESTS: 'SITE_HTTP_429_TOO_MANY_REQUESTS',
  SITE_HTTP_403_WAF_GURU: 'SITE_HTTP_403_WAF_GURU',
  SITE_UI_UNKNOWN: 'SITE_UI_UNKNOWN',
} as const;

/** Exact heading: Application Temporarily Unavailable. */
export const PORTAL_SITE_APP_TEMPORARILY_UNAVAILABLE_HEADING =
  'Application Temporarily Unavailable';

/** Body cues for temporary-unavailable pages (OR match). */
export const PORTAL_SITE_APP_TEMPORARILY_UNAVAILABLE_BODY_CUES = [
  'our application is currently experiencing technical difficulties',
  'please try again later',
] as const;

/** Exact heading: 504 Gateway Time-out. */
export const PORTAL_SITE_HTTP_504_HEADING = '504 Gateway Time-out';

/** Footer/body cue for nginx 504 pages. */
export const PORTAL_SITE_HTTP_504_NGINX_CUE = 'nginx';

/** Exact heading: Too Many Requests. */
export const PORTAL_SITE_HTTP_429_HEADING = 'Too Many Requests';

/** Body cues for IP rate-limit pages (OR match). */
export const PORTAL_SITE_HTTP_429_BODY_CUES = [
  'we have detected excessive requests from your IP address',
  'please try again after some time',
] as const;

/** Branded WAF heading fragment. */
export const PORTAL_SITE_HTTP_403_WAF_ERROR_HEADING = '403 Error';

/** Forbidden label on branded / plain 403 pages. */
export const PORTAL_SITE_HTTP_403_FORBIDDEN = 'Forbidden';

/** Plain 403 body (essentially this alone). */
export const PORTAL_SITE_HTTP_403_PLAIN_BODY = '403 Forbidden';

/** Branded WAF metadata line prefixes (case-insensitive). */
export const PORTAL_SITE_HTTP_403_WAF_REQUEST_ID_PREFIX = 'Request ID:';

export const PORTAL_SITE_HTTP_403_WAF_GURU_PREFIX = 'Guru meditation:';

export const PORTAL_SITE_HTTP_403_WAF_IP_PREFIX = 'IP:';

export const PORTAL_SITE_HTTP_403_WAF_REQUEST_TOKEN_PREFIX = 'Request:';

/**
 * Resume hint tokens persisted in stuck evidence (FR-6).
 * Runner schedules generic SAFE_TO_REPEAT backoff; longer cooldowns are follow-up.
 */
export const PORTAL_SITE_HTTP_RESUME_HINT = {
  LONG_BACKOFF_MAINTENANCE: 'long_backoff_maintenance',
  PROXY_ROTATE: 'proxy_rotate',
  COOLDOWN_THEN_PROXY_ROTATE: 'cooldown_then_proxy_rotate',
  ESCALATE_AFTER_BOUNDED_RETRY: 'escalate_after_bounded_retry',
} as const;
