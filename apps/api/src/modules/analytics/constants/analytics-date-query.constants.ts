/**
 * Accepts calendar `YYYY-MM-DD` or ISO-8601 datetime for analytics from/to.
 */
export const ANALYTICS_DATE_QUERY_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?)?$/;

export const ANALYTICS_DATE_QUERY_PATTERN_MESSAGE =
  'from/to must be YYYY-MM-DD or an ISO-8601 datetime';
