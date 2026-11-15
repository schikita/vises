/**
 * Pure-function verification for successful-enter SITE_* / evidence / home cues
 * (SE-T02 / SE-T04). No Playwright required.
 *
 * Run: `node apps/workflow-worker/scripts/verify-successful-enter-classifiers.mjs`
 * (from repo root) or from package dir:
 * `node scripts/verify-successful-enter-classifiers.mjs`
 *
 * Mirrors classifyPortalSiteHttpErrorFromText + checkPortalAuthenticatedHomeCues
 * + buildPortalStuckEvidenceMessage recognition strings from materials.
 */

const PORTAL_SITE_HTTP_ERROR_CODE = {
  SITE_APP_TEMPORARILY_UNAVAILABLE: 'SITE_APP_TEMPORARILY_UNAVAILABLE',
  SITE_HTTP_504_GATEWAY_TIMEOUT: 'SITE_HTTP_504_GATEWAY_TIMEOUT',
  SITE_HTTP_403_PLAIN: 'SITE_HTTP_403_PLAIN',
  SITE_HTTP_429_TOO_MANY_REQUESTS: 'SITE_HTTP_429_TOO_MANY_REQUESTS',
  SITE_HTTP_403_WAF_GURU: 'SITE_HTTP_403_WAF_GURU',
  SITE_UI_UNKNOWN: 'SITE_UI_UNKNOWN',
};

const normalize = (text) => text.replace(/\s+/g, ' ').trim();
const normalizeLower = (text) => normalize(text).toLowerCase();

const extractPrefixedValue = (body, prefix) => {
  const lower = body.toLowerCase();
  const needle = prefix.toLowerCase();
  const idx = lower.indexOf(needle);
  if (idx < 0) return undefined;
  const after = body.slice(idx + prefix.length).trim();
  const line = after.split(/\r?\n/)[0] ?? after;
  const token = line.replace(/\s+/g, ' ').trim().split(/\s+/)[0]?.trim();
  return token && token.length > 0 ? token.slice(0, 120) : undefined;
};

const classifyPortalSiteHttpErrorFromText = (input) => {
  const body = normalize(input.bodyText ?? '');
  const lower = normalizeLower(body);
  const status = input.httpStatus ?? null;

  if (lower.includes('application temporarily unavailable')) {
    return {
      matched: true,
      code: PORTAL_SITE_HTTP_ERROR_CODE.SITE_APP_TEMPORARILY_UNAVAILABLE,
      resumeHint: 'long_backoff_maintenance',
      recognitionText: 'Application Temporarily Unavailable',
    };
  }

  if (lower.includes('504 gateway time-out')) {
    return {
      matched: true,
      code: PORTAL_SITE_HTTP_ERROR_CODE.SITE_HTTP_504_GATEWAY_TIMEOUT,
      resumeHint: 'proxy_rotate',
      recognitionText: '504 Gateway Time-out',
    };
  }

  if (lower.includes('too many requests')) {
    const bodyCue =
      lower.includes(
        'we have detected excessive requests from your ip address',
      ) || lower.includes('please try again after some time');
    if (bodyCue || status === 429) {
      return {
        matched: true,
        code: PORTAL_SITE_HTTP_ERROR_CODE.SITE_HTTP_429_TOO_MANY_REQUESTS,
        resumeHint: 'cooldown_then_proxy_rotate',
        recognitionText: 'Too Many Requests',
      };
    }
  }

  const hasWafErrorHeading = lower.includes('403 error');
  const hasForbidden = lower.includes('forbidden');
  const requestId = extractPrefixedValue(body, 'Request ID:');
  const guruMeditation = extractPrefixedValue(body, 'Guru meditation:');
  const blockedIp = extractPrefixedValue(body, 'IP:');
  const hasWafMeta =
    Boolean(requestId) ||
    Boolean(guruMeditation) ||
    lower.includes('guru meditation:') ||
    lower.includes('request id:');

  if (hasWafErrorHeading && hasForbidden && hasWafMeta) {
    return {
      matched: true,
      code: PORTAL_SITE_HTTP_ERROR_CODE.SITE_HTTP_403_WAF_GURU,
      resumeHint: 'proxy_rotate',
      recognitionText: '403 Error Forbidden',
      ...(requestId ? { requestId } : {}),
      ...(guruMeditation ? { guruMeditation } : {}),
      ...(blockedIp ? { blockedIp } : {}),
    };
  }

  if (lower.includes('403 forbidden') && !hasWafMeta && !hasWafErrorHeading) {
    return {
      matched: true,
      code: PORTAL_SITE_HTTP_ERROR_CODE.SITE_HTTP_403_PLAIN,
      resumeHint: 'proxy_rotate',
      recognitionText: '403 Forbidden',
    };
  }

  return { matched: false };
};

const buildPortalStuckEvidenceMessage = (evidence) => {
  const parts = [];
  if (evidence.stuckPoint) parts.push(`stuckPoint=${evidence.stuckPoint}`);
  if (evidence.pageUrl) parts.push(`pageUrl=${evidence.pageUrl}`);
  if (evidence.httpStatus !== undefined && evidence.httpStatus !== null) {
    parts.push(`httpStatus=${evidence.httpStatus}`);
  }
  if (evidence.resumeHint) parts.push(`resumeHint=${evidence.resumeHint}`);
  if (evidence.requestId) parts.push(`requestId=${evidence.requestId}`);
  if (evidence.guruMeditation) {
    parts.push(`guruMeditation=${evidence.guruMeditation}`);
  }
  if (evidence.blockedIp) parts.push(`blockedIp=${evidence.blockedIp}`);
  if (evidence.recognitionText?.trim()) {
    parts.push(
      `text=${evidence.recognitionText.replace(/\s+/g, ' ').trim().slice(0, 200)}`,
    );
  }
  return parts.join(' ').slice(0, 500);
};

const checkPortalAuthenticatedHomeCues = (input) => {
  const urlLower = (input.pageUrl ?? '').toLowerCase();
  const bodyLower = (input.bodyText ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  const cues = {
    pathIncludesHome: urlLower.includes('/global/home/index'),
    visaProcessHeadingPresent: bodyLower.includes('visa application process'),
    manageAppointmentsPresent: bodyLower.includes('manage appointments'),
    newappointmentCtaPresent: input.newappointmentCtaPresent === true,
    loginFormPrimary: input.loginFormPrimary === true,
    headerLoginLinkPresent: input.headerLoginLinkPresent,
  };
  const recognized =
    cues.pathIncludesHome &&
    cues.visaProcessHeadingPresent &&
    cues.manageAppointmentsPresent &&
    cues.newappointmentCtaPresent &&
    !cues.loginFormPrimary;
  return { recognized, cues };
};

const isPortalHomeDoorstepHref = (href) =>
  (href ?? '').toLowerCase().includes('doorstepservice');

const isPortalHomeNewappointmentHref = (href) => {
  const lower = (href ?? '').toLowerCase();
  if (isPortalHomeDoorstepHref(lower)) return false;
  return lower.includes('newappointment');
};

let failed = 0;
const assert = (name, cond, detail = '') => {
  if (!cond) {
    failed += 1;
    console.error(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
  } else {
    console.log(`PASS ${name}`);
  }
};

// --- SITE_* five families (host-independent) ---
{
  const r = classifyPortalSiteHttpErrorFromText({
    bodyText:
      'Application Temporarily Unavailable\n\nour application is currently experiencing technical difficulties. Please try again later.',
  });
  assert(
    'SITE_APP_TEMPORARILY_UNAVAILABLE',
    r.matched &&
      r.code === PORTAL_SITE_HTTP_ERROR_CODE.SITE_APP_TEMPORARILY_UNAVAILABLE,
  );
}

{
  const r = classifyPortalSiteHttpErrorFromText({
    bodyText: '504 Gateway Time-out\n\nnginx',
    httpStatus: 504,
  });
  assert(
    'SITE_HTTP_504_GATEWAY_TIMEOUT',
    r.matched &&
      r.code === PORTAL_SITE_HTTP_ERROR_CODE.SITE_HTTP_504_GATEWAY_TIMEOUT,
  );
}

{
  const r = classifyPortalSiteHttpErrorFromText({
    bodyText: '403 Forbidden',
    httpStatus: 403,
  });
  assert(
    'SITE_HTTP_403_PLAIN',
    r.matched && r.code === PORTAL_SITE_HTTP_ERROR_CODE.SITE_HTTP_403_PLAIN,
  );
}

{
  const r = classifyPortalSiteHttpErrorFromText({
    bodyText:
      'Too Many Requests\n\nWe have detected excessive requests from your IP address. please try again after some time',
    httpStatus: 429,
  });
  assert(
    'SITE_HTTP_429_TOO_MANY_REQUESTS',
    r.matched &&
      r.code === PORTAL_SITE_HTTP_ERROR_CODE.SITE_HTTP_429_TOO_MANY_REQUESTS,
  );
}

{
  const r = classifyPortalSiteHttpErrorFromText({
    bodyText: `403 Error
Forbidden
Access to appointment.blsspainrussia.ru is forbidden.
IP: 1.2.3.4
Request: abcTOKEN
Request ID: deadbeef
Guru meditation: guruTOKEN`,
    httpStatus: 403,
  });
  assert(
    'SITE_HTTP_403_WAF_GURU',
    r.matched &&
      r.code === PORTAL_SITE_HTTP_ERROR_CODE.SITE_HTTP_403_WAF_GURU &&
      r.requestId === 'deadbeef' &&
      r.guruMeditation === 'guruTOKEN',
    r.matched ? `id=${r.requestId} guru=${r.guruMeditation}` : 'no match',
  );
}

{
  const r = classifyPortalSiteHttpErrorFromText({
    bodyText: 'Hello portal chrome with Manage Appointments',
  });
  assert('no false SITE_* on portal chrome', r.matched === false);
}

// --- evidence ≤500 ---
{
  const msg = buildPortalStuckEvidenceMessage({
    stuckPoint: 'HOME_NOT_READY',
    pageUrl: 'https://appointment.example/Global/home/index',
    httpStatus: 403,
    resumeHint: 'proxy_rotate',
    requestId: 'deadbeef',
    guruMeditation: 'guruTOKEN',
    blockedIp: '1.2.3.4',
    recognitionText: 'x'.repeat(300),
  });
  assert('evidence message ≤500', msg.length <= 500, `len=${msg.length}`);
  assert(
    'evidence includes stuckPoint+resumeHint',
    msg.includes('stuckPoint=HOME_NOT_READY') &&
      msg.includes('resumeHint=proxy_rotate'),
  );
}

// --- home cues: Login lock must NOT fail (AC-3) ---
{
  const r = checkPortalAuthenticatedHomeCues({
    pageUrl: 'https://appointment.blsspainbelarus.by/Global/home/index',
    bodyText:
      'VISA APPLICATION PROCESS Manage Appointments Book New Appointment Login',
    loginFormPrimary: false,
    newappointmentCtaPresent: true,
    headerLoginLinkPresent: true,
  });
  assert(
    'HOME_RECOGNIZED with header Login lock',
    r.recognized === true,
  );
}

{
  const r = checkPortalAuthenticatedHomeCues({
    pageUrl: 'https://appointment.example/Global/home/index',
    bodyText: 'VISA APPLICATION PROCESS Manage Appointments',
    loginFormPrimary: false,
    newappointmentCtaPresent: false,
    headerLoginLinkPresent: false,
  });
  assert('HOME fails without newappointment CTA', r.recognized === false);
}

// --- doorstep never treated as booking CTA ---
{
  assert(
    'doorstep href rejected',
    isPortalHomeDoorstepHref('/Global/bls/doorstepservice') === true,
  );
  assert(
    'doorstep not newappointment',
    isPortalHomeNewappointmentHref('/Global/bls/doorstepservice') === false,
  );
  assert(
    'newappointment accepted',
    isPortalHomeNewappointmentHref('/Global/appointment/newappointment') ===
      true,
  );
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log('\nAll successful-enter classifier checks passed');
