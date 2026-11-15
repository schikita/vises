import assert from 'node:assert/strict';
import {
  PORTAL_BOOKING_EMAIL_CONSENT_ERROR_CODE,
  PORTAL_BOOKING_EMAIL_CONSENT_OPEN_LINK_FAILED,
} from '../constants';
import type { PortalPage } from '../types/patchright-surface.types';
import { completePortalBookingEmailConsent } from './complete-portal-booking-email-consent.util';
import { redactPortalBookingEmailConsentErrorDetail } from './redact-portal-booking-email-consent-error-detail.util';

/**
 * VT-TASK-006 open_link failure must not leak consent URL/`data=` (NFR-002).
 * Run: npx --yes tsx src/modules/portal-fill/utils/complete-portal-booking-email-consent.util.spec.ts
 */

const LEAKY_CONSENT_URL =
  'https://bls.example/dataprotectionemailaccept?data=SECRET_TOKEN_VALUE&x=1';
const LEAKY_GOTO_MESSAGE = `page.goto: Timeout 30000ms exceeded.\nCall log:\n  - navigating to "${LEAKY_CONSENT_URL}", waiting until "domcontentloaded"`;

const redacted = redactPortalBookingEmailConsentErrorDetail(LEAKY_GOTO_MESSAGE);
assert.equal(redacted.includes('https://'), false, 'redact must strip URLs');
assert.equal(
  redacted.includes('SECRET_TOKEN_VALUE'),
  false,
  'redact must strip consent token from URL',
);
assert.ok(redacted.includes('[REDACTED_URL]'), 'redact must mark URLs');

const redactedBareData = redactPortalBookingEmailConsentErrorDetail(
  'open failed data=SECRET_TOKEN_VALUE trailing',
);
assert.equal(
  redactedBareData.includes('SECRET_TOKEN_VALUE'),
  false,
  'redact must strip bare data= tokens',
);
assert.ok(
  redactedBareData.includes('data=[REDACTED]'),
  'redact must mark bare data=',
);

const run = async (): Promise<void> => {
  const page = {
    goto: async (): Promise<never> => {
      throw new Error(LEAKY_GOTO_MESSAGE);
    },
  } as unknown as PortalPage;

  const mailProvider = {
    createAccount: async (): Promise<{ address: string }> => ({
      address: 'retained@example.com',
    }),
    waitLatestMessage: async (): Promise<{
      messageId: string;
      body: string;
    }> => ({
      messageId: 'msg-1',
      body: '<html>consent</html>',
    }),
    extractDataProtectionConsentHref: (): string => LEAKY_CONSENT_URL,
    disposeSession: async (): Promise<void> => undefined,
  };

  const result = await completePortalBookingEmailConsent({
    page,
    mailProvider,
    mailbox: {
      contextKey: 'ctx-1',
      token: '',
      restoreAddress: 'retained@example.com',
    },
    alreadyConsented: false,
    logPrefix: 'test-email-consent',
  });

  assert.equal(result.ok, false, 'goto rejection must fail open_link');
  if (result.ok) {
    throw new Error('unreachable');
  }
  assert.equal(
    result.error,
    PORTAL_BOOKING_EMAIL_CONSENT_OPEN_LINK_FAILED,
    'error must be fixed open_link_failed phase code',
  );
  assert.equal(
    result.errorCode,
    PORTAL_BOOKING_EMAIL_CONSENT_ERROR_CODE.OPEN,
    'errorCode must be OPEN',
  );
  assert.equal(
    result.error.includes('https://'),
    false,
    'returned error must not contain URL',
  );
  assert.equal(
    result.error.includes('data='),
    false,
    'returned error must not contain data=',
  );
  assert.equal(
    result.error.includes('SECRET_TOKEN_VALUE'),
    false,
    'returned error must not contain consent token',
  );
  assert.equal(
    LEAKY_GOTO_MESSAGE.includes('data='),
    true,
    'fixture sanity: leaky message contains data=',
  );

  console.log('complete-portal-booking-email-consent.util.spec.ts: ok');
};

run().catch((err: unknown): void => {
  console.error(err);
  process.exitCode = 1;
});
