import {
  PORTAL_SITE_APP_TEMPORARILY_UNAVAILABLE_HEADING,
  PORTAL_SITE_HTTP_403_FORBIDDEN,
  PORTAL_SITE_HTTP_403_PLAIN_BODY,
  PORTAL_SITE_HTTP_403_WAF_ERROR_HEADING,
  PORTAL_SITE_HTTP_403_WAF_GURU_PREFIX,
  PORTAL_SITE_HTTP_403_WAF_IP_PREFIX,
  PORTAL_SITE_HTTP_403_WAF_REQUEST_ID_PREFIX,
  PORTAL_SITE_HTTP_403_WAF_REQUEST_TOKEN_PREFIX,
  PORTAL_SITE_HTTP_429_BODY_CUES,
  PORTAL_SITE_HTTP_429_HEADING,
  PORTAL_SITE_HTTP_504_HEADING,
  PORTAL_SITE_HTTP_504_NGINX_CUE,
  PORTAL_SITE_HTTP_ERROR_CODE,
  PORTAL_SITE_HTTP_RESUME_HINT,
} from '../constants';
import type {
  ClassifyPortalSiteHttpErrorFromTextInput,
  ClassifyPortalSiteHttpErrorFromTextResult,
} from '../types';

const normalize = (text: string): string =>
  text.replace(/\s+/g, ' ').trim();

const normalizeLower = (text: string): string => normalize(text).toLowerCase();

const extractPrefixedValue = (
  body: string,
  prefix: string,
): string | undefined => {
  const lower = body.toLowerCase();
  const needle = prefix.toLowerCase();
  const idx = lower.indexOf(needle);
  if (idx < 0) {
    return undefined;
  }
  const after = body.slice(idx + prefix.length).trim();
  const line = after.split(/\r?\n/)[0] ?? after;
  const token = line.replace(/\s+/g, ' ').trim().split(/\s+/)[0]?.trim();
  return token && token.length > 0 ? token.slice(0, 120) : undefined;
};

/**
 * Host-independent SITE_* classifier from body text + optional HTTP status
 * (FR-6 / FR-12). Prefer WAF/HTTP families before UI assumptions.
 */
export const classifyPortalSiteHttpErrorFromText = (
  input: ClassifyPortalSiteHttpErrorFromTextInput,
): ClassifyPortalSiteHttpErrorFromTextResult => {
  const body = normalize(input.bodyText ?? '');
  const lower = normalizeLower(body);
  const status = input.httpStatus ?? null;

  // 1. Application Temporarily Unavailable (status not required).
  if (
    lower.includes(
      normalizeLower(PORTAL_SITE_APP_TEMPORARILY_UNAVAILABLE_HEADING),
    )
  ) {
    return {
      matched: true,
      code: PORTAL_SITE_HTTP_ERROR_CODE.SITE_APP_TEMPORARILY_UNAVAILABLE,
      resumeHint: PORTAL_SITE_HTTP_RESUME_HINT.LONG_BACKOFF_MAINTENANCE,
      recognitionText: PORTAL_SITE_APP_TEMPORARILY_UNAVAILABLE_HEADING,
    };
  }

  // 2. 504 Gateway Time-out (+ nginx preferred; status 504 reinforces).
  if (lower.includes(normalizeLower(PORTAL_SITE_HTTP_504_HEADING))) {
    const hasNginx = lower.includes(
      normalizeLower(PORTAL_SITE_HTTP_504_NGINX_CUE),
    );
    if (hasNginx || status === 504 || status === null) {
      return {
        matched: true,
        code: PORTAL_SITE_HTTP_ERROR_CODE.SITE_HTTP_504_GATEWAY_TIMEOUT,
        resumeHint: PORTAL_SITE_HTTP_RESUME_HINT.PROXY_ROTATE,
        recognitionText: PORTAL_SITE_HTTP_504_HEADING,
      };
    }
  }

  // 3. Too Many Requests + excessive-IP body (status 429 preferred).
  if (lower.includes(normalizeLower(PORTAL_SITE_HTTP_429_HEADING))) {
    const bodyCue = PORTAL_SITE_HTTP_429_BODY_CUES.some((cue) =>
      lower.includes(normalizeLower(cue)),
    );
    if (bodyCue || status === 429) {
      return {
        matched: true,
        code: PORTAL_SITE_HTTP_ERROR_CODE.SITE_HTTP_429_TOO_MANY_REQUESTS,
        resumeHint: PORTAL_SITE_HTTP_RESUME_HINT.COOLDOWN_THEN_PROXY_ROTATE,
        recognitionText: PORTAL_SITE_HTTP_429_HEADING,
      };
    }
  }

  // 4. Branded 403 WAF + Guru / Request ID (before plain 403).
  const hasWafErrorHeading = lower.includes(
    normalizeLower(PORTAL_SITE_HTTP_403_WAF_ERROR_HEADING),
  );
  const hasForbidden = lower.includes(
    normalizeLower(PORTAL_SITE_HTTP_403_FORBIDDEN),
  );
  const requestId = extractPrefixedValue(
    body,
    PORTAL_SITE_HTTP_403_WAF_REQUEST_ID_PREFIX,
  );
  const guruMeditation = extractPrefixedValue(
    body,
    PORTAL_SITE_HTTP_403_WAF_GURU_PREFIX,
  );
  const blockedIp = extractPrefixedValue(
    body,
    PORTAL_SITE_HTTP_403_WAF_IP_PREFIX,
  );
  const requestToken = extractPrefixedValue(
    body,
    PORTAL_SITE_HTTP_403_WAF_REQUEST_TOKEN_PREFIX,
  );
  const hasWafMeta =
    Boolean(requestId) ||
    Boolean(guruMeditation) ||
    lower.includes(normalizeLower(PORTAL_SITE_HTTP_403_WAF_GURU_PREFIX)) ||
    lower.includes(normalizeLower(PORTAL_SITE_HTTP_403_WAF_REQUEST_ID_PREFIX));

  if (hasWafErrorHeading && hasForbidden && hasWafMeta) {
    return {
      matched: true,
      code: PORTAL_SITE_HTTP_ERROR_CODE.SITE_HTTP_403_WAF_GURU,
      resumeHint: PORTAL_SITE_HTTP_RESUME_HINT.PROXY_ROTATE,
      recognitionText: `${PORTAL_SITE_HTTP_403_WAF_ERROR_HEADING} ${PORTAL_SITE_HTTP_403_FORBIDDEN}`,
      ...(requestId ? { requestId } : {}),
      ...(guruMeditation ? { guruMeditation } : {}),
      ...(blockedIp ? { blockedIp } : {}),
      ...(requestToken ? { requestToken } : {}),
    };
  }

  // 5. Plain 403 Forbidden only — no Guru / Request ID.
  const plainBody = normalizeLower(PORTAL_SITE_HTTP_403_PLAIN_BODY);
  if (
    lower.includes(plainBody) &&
    !hasWafMeta &&
    !hasWafErrorHeading
  ) {
    return {
      matched: true,
      code: PORTAL_SITE_HTTP_ERROR_CODE.SITE_HTTP_403_PLAIN,
      resumeHint: PORTAL_SITE_HTTP_RESUME_HINT.PROXY_ROTATE,
      recognitionText: PORTAL_SITE_HTTP_403_PLAIN_BODY,
    };
  }

  return { matched: false };
};

/**
 * Classify including SITE_UI_UNKNOWN when no known family matches
 * (FR-6 fallback after ordered checks).
 */
export const classifyPortalSiteHttpErrorFromTextOrUnknown = (
  input: ClassifyPortalSiteHttpErrorFromTextInput,
): Extract<ClassifyPortalSiteHttpErrorFromTextResult, { matched: true }> => {
  const known = classifyPortalSiteHttpErrorFromText(input);
  if (known.matched) {
    return known;
  }
  const snippet = normalize(input.bodyText ?? '').slice(0, 200);
  return {
    matched: true,
    code: PORTAL_SITE_HTTP_ERROR_CODE.SITE_UI_UNKNOWN,
    resumeHint: PORTAL_SITE_HTTP_RESUME_HINT.ESCALATE_AFTER_BOUNDED_RETRY,
    recognitionText: snippet || 'unclassified_non_happy_page',
  };
};
