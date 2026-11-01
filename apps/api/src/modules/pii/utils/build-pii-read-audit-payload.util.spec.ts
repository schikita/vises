import {
  PII_AUDIT_CIPHERTEXT_PREFIX_LENGTH,
  PII_AUDIT_EVENT_TYPE,
} from '../constants';
import { buildPiiReadAuditPayload } from './build-pii-read-audit-payload.util';

describe('buildPiiReadAuditPayload (AC-10)', (): void => {
  it('emits actor/action/clientId/timestamp and ciphertext prefix only', (): void => {
    const packed =
      'YWJjZGVmZ2hpams=:dGFndGFndGFndGFn:Y2lwaGVydGV4dGNpcGhlcnRleHQ=';
    const plainLeak = 'SHOULD_NOT_APPEAR';
    const payload = buildPiiReadAuditPayload(
      {
        actorId: 'u1',
        actorRole: 'admin',
        action: 'passport.read',
        clientId: 'c1',
      },
      packed,
      new Date('2026-01-15T12:00:00.000Z'),
    );

    expect(payload).toEqual({
      type: PII_AUDIT_EVENT_TYPE,
      actorId: 'u1',
      actorRole: 'admin',
      action: 'passport.read',
      clientId: 'c1',
      timestamp: '2026-01-15T12:00:00.000Z',
      ciphertextPrefix: packed.slice(0, PII_AUDIT_CIPHERTEXT_PREFIX_LENGTH),
    });
    expect(payload.ciphertextPrefix.length).toBe(
      PII_AUDIT_CIPHERTEXT_PREFIX_LENGTH,
    );
    expect(JSON.stringify(payload).includes(plainLeak)).toBe(false);
    expect(payload.ciphertextPrefix).not.toContain(plainLeak);
  });
});
