const URL_PATTERN = /https?:\/\/\S+/gi;
/** Matches `data=` tokens remaining after URL redaction (query fragments / bare). */
const DATA_QUERY_PATTERN = /\bdata=[^&\s#"']*/gi;

/**
 * Strip consent navigation URLs and `data=` query tokens from error detail
 * before any log/return emission (NFR-002 / VT-TASK-006).
 */
export const redactPortalBookingEmailConsentErrorDetail = (
  detail: string,
): string =>
  detail
    .replace(URL_PATTERN, '[REDACTED_URL]')
    .replace(DATA_QUERY_PATTERN, 'data=[REDACTED]');
