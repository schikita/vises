'use strict';

/**
 * TASK-020 — crypto + retry/state helpers (NFR-005).
 * Pure utils only; no Nest bootstrap. Never logs plaintext / keys / DEKs.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const path = require('node:path');

const distSecretsUtils = path.join(
  __dirname,
  '..',
  '..',
  'dist',
  'modules',
  'bls-secrets',
  'utils',
);
const distWorkflowUtils = path.join(
  __dirname,
  '..',
  '..',
  'dist',
  'modules',
  'bls-workflow',
  'utils',
);
const distWorkflowConstants = path.join(
  __dirname,
  '..',
  '..',
  'dist',
  'modules',
  'bls-workflow',
  'constants',
);

const { aesGcmSeal } = require(
  path.join(distSecretsUtils, 'aes-gcm-seal.util.js'),
);
const { aesGcmOpen } = require(
  path.join(distSecretsUtils, 'aes-gcm-open.util.js'),
);
const { wrapDek } = require(path.join(distSecretsUtils, 'wrap-dek.util.js'));
const { unwrapDek } = require(
  path.join(distSecretsUtils, 'unwrap-dek.util.js'),
);
const { assertBlsCompleteVerified } = require(
  path.join(distWorkflowUtils, 'assert-bls-complete-verified.util.js'),
);
const { isBlsWorkflowErrorClassAutoRetryable } = require(
  path.join(
    distWorkflowUtils,
    'is-bls-workflow-error-class-auto-retryable.util.js',
  ),
);
const { isBlsWorkflowErrorClassNotSafeToRepeat } = require(
  path.join(
    distWorkflowUtils,
    'is-bls-workflow-error-class-not-safe-to-repeat.util.js',
  ),
);
const { isBlsWorkflowErrorClassSafeToRepeat } = require(
  path.join(
    distWorkflowUtils,
    'is-bls-workflow-error-class-safe-to-repeat.util.js',
  ),
);
const { isBlsWorkflowErrorClassVerifyThenRepeat } = require(
  path.join(
    distWorkflowUtils,
    'is-bls-workflow-error-class-verify-then-repeat.util.js',
  ),
);
const { classifyPortalBookingUnsafeAction } = require(
  path.join(
    distWorkflowUtils,
    'classify-portal-booking-unsafe-action.util.js',
  ),
);
const {
  BLS_WORKFLOW_ERROR_CLASS,
  BLS_WORKFLOW_MSG_COMPLETE_WITHOUT_VERIFY,
} = require(path.join(distWorkflowConstants, 'bls-workflow.constants.js'));

/** Runner-style gate: only auto-retryable classes may set nextRunAt. */
const mayAutoScheduleRetry = (errorClass) =>
  isBlsWorkflowErrorClassAutoRetryable(errorClass) &&
  !isBlsWorkflowErrorClassNotSafeToRepeat(errorClass);

describe('AES-GCM + wrapped DEK (TASK-020 / DEC-005)', () => {
  it('encrypt/decrypt round-trip preserves payload bytes', () => {
    const masterKey = randomBytes(32);
    const dek = randomBytes(32);
    const plain = randomBytes(48);
    try {
      const sealed = aesGcmSeal(dek, plain);
      const opened = aesGcmOpen(dek, sealed.nonce, sealed.ciphertext);
      assert.equal(Buffer.compare(opened, plain), 0);

      const wrapped = wrapDek(masterKey, dek);
      const unwrapped = unwrapDek(masterKey, wrapped);
      assert.equal(Buffer.compare(unwrapped, dek), 0);
      unwrapped.fill(0);
    } finally {
      masterKey.fill(0);
      dek.fill(0);
      plain.fill(0);
    }
  });

  it('wrong master key fails unwrap / open (auth failure)', () => {
    const masterKey = randomBytes(32);
    const wrongKey = randomBytes(32);
    const dek = randomBytes(32);
    const plain = randomBytes(16);
    try {
      const wrapped = wrapDek(masterKey, dek);
      const sealed = aesGcmSeal(dek, plain);

      assert.throws(() => unwrapDek(wrongKey, wrapped));
      assert.throws(() =>
        aesGcmOpen(wrongKey, sealed.nonce, sealed.ciphertext),
      );
    } finally {
      masterKey.fill(0);
      wrongKey.fill(0);
      dek.fill(0);
      plain.fill(0);
    }
  });
});

describe('Retry classification helpers (TASK-020 / DEC-004)', () => {
  it('classifies SAFE / VERIFY / NOT_SAFE correctly', () => {
    const { SAFE_TO_REPEAT, VERIFY_THEN_REPEAT, NOT_SAFE_TO_REPEAT } =
      BLS_WORKFLOW_ERROR_CLASS;

    assert.equal(isBlsWorkflowErrorClassSafeToRepeat(SAFE_TO_REPEAT), true);
    assert.equal(
      isBlsWorkflowErrorClassVerifyThenRepeat(VERIFY_THEN_REPEAT),
      true,
    );
    assert.equal(
      isBlsWorkflowErrorClassNotSafeToRepeat(NOT_SAFE_TO_REPEAT),
      true,
    );

    assert.equal(isBlsWorkflowErrorClassAutoRetryable(SAFE_TO_REPEAT), true);
    assert.equal(
      isBlsWorkflowErrorClassAutoRetryable(VERIFY_THEN_REPEAT),
      true,
    );
    assert.equal(
      isBlsWorkflowErrorClassAutoRetryable(NOT_SAFE_TO_REPEAT),
      false,
    );
  });

  it('booking unsafe actions classify as NOT_SAFE_TO_REPEAT', () => {
    const result = classifyPortalBookingUnsafeAction('visa_type_submit');
    assert.equal(
      result.errorClass,
      BLS_WORKFLOW_ERROR_CLASS.NOT_SAFE_TO_REPEAT,
    );
    assert.equal(
      isBlsWorkflowErrorClassAutoRetryable(result.errorClass),
      false,
    );
  });
});

describe('State / schedule gates (TASK-020 / REQ-007 / DEC-004)', () => {
  it('cannot COMPLETED without verifiedExternalState === true', () => {
    assert.throws(
      () => assertBlsCompleteVerified({ verifiedExternalState: false }),
      (err) =>
        err instanceof Error &&
        err.message === BLS_WORKFLOW_MSG_COMPLETE_WITHOUT_VERIFY,
    );
    assert.throws(
      () => assertBlsCompleteVerified({ verifiedExternalState: undefined }),
      (err) => err instanceof Error,
    );
    assert.doesNotThrow(() =>
      assertBlsCompleteVerified({ verifiedExternalState: true }),
    );
  });

  it('NOT_SAFE_TO_REPEAT blocks auto schedule helpers', () => {
    const { SAFE_TO_REPEAT, VERIFY_THEN_REPEAT, NOT_SAFE_TO_REPEAT } =
      BLS_WORKFLOW_ERROR_CLASS;

    assert.equal(mayAutoScheduleRetry(SAFE_TO_REPEAT), true);
    assert.equal(mayAutoScheduleRetry(VERIFY_THEN_REPEAT), true);
    assert.equal(mayAutoScheduleRetry(NOT_SAFE_TO_REPEAT), false);
    assert.equal(
      isBlsWorkflowErrorClassNotSafeToRepeat(NOT_SAFE_TO_REPEAT),
      true,
    );
  });
});
