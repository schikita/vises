import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { randomBytes } from 'crypto';
import { AES_256_KEY_BYTES } from '../../shared/constants/aes-256-gcm.constants';
import { APP_LOGGER } from '../logger/constants';
import { PiiAuditService } from './pii-audit.service';
import { PiiCryptoService } from './pii-crypto.service';
import {
  PII_AUDIT_CIPHERTEXT_PREFIX_LENGTH,
  PII_AUDIT_EVENT_TYPE,
  PII_AUDIT_LOG_CONTEXT,
  PII_MSG_KEY_UNAVAILABLE,
} from './constants';
import type { PiiReadAuditPayload } from './types';

describe('PiiCryptoService (AC-9 / AC-10)', (): void => {
  const testKeyHex = randomBytes(AES_256_KEY_BYTES).toString('hex');
  const auditContext = {
    actorId: 'agent-1',
    actorRole: 'agent',
    action: 'client.passport.read',
    clientId: 'client-1',
  };

  const createModule = async (
    keyHex: string,
  ): Promise<{
    crypto: PiiCryptoService;
    log: jest.Mock;
    moduleRef: TestingModule;
  }> => {
    const log = jest.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        PiiCryptoService,
        PiiAuditService,
        {
          provide: ConfigService,
          useValue: {
            get: (name: string): string => {
              if (name === 'VISES_PII_ENCRYPTION_KEY') {
                return keyHex;
              }
              return '';
            },
          },
        },
        {
          provide: APP_LOGGER,
          useValue: { log, error: jest.fn(), warn: jest.fn() },
        },
      ],
    }).compile();

    return {
      crypto: moduleRef.get(PiiCryptoService),
      log,
      moduleRef,
    };
  };

  it('encrypts and decrypts with audit payload using ciphertext prefix only', async (): Promise<void> => {
    const { crypto, log, moduleRef } = await createModule(testKeyHex);
    const plain = 'secret-passport-number';
    const packed = crypto.encrypt(plain);
    expect(packed.split(':')).toHaveLength(3);
    expect(packed.includes(plain)).toBe(false);

    const decrypted = crypto.decrypt(packed, auditContext);
    expect(decrypted).toBe(plain);

    expect(log).toHaveBeenCalledTimes(1);
    const [message, context] = log.mock.calls[0] as [string, string];
    expect(context).toBe(PII_AUDIT_LOG_CONTEXT);
    const payload = JSON.parse(message) as PiiReadAuditPayload;
    expect(payload.type).toBe(PII_AUDIT_EVENT_TYPE);
    expect(payload.actorId).toBe(auditContext.actorId);
    expect(payload.actorRole).toBe(auditContext.actorRole);
    expect(payload.action).toBe(auditContext.action);
    expect(payload.clientId).toBe(auditContext.clientId);
    expect(typeof payload.timestamp).toBe('string');
    expect(payload.ciphertextPrefix).toBe(
      packed.slice(0, PII_AUDIT_CIPHERTEXT_PREFIX_LENGTH),
    );
    expect(payload.ciphertextPrefix.includes(plain)).toBe(false);
    expect(JSON.stringify(payload).includes(plain)).toBe(false);

    await moduleRef.close();
  });

  it('fails closed with 503 when PII key is empty', async (): Promise<void> => {
    const { crypto, moduleRef } = await createModule('');
    try {
      expect(() => crypto.encrypt('x')).toThrow(HttpException);
      try {
        crypto.encrypt('x');
        throw new Error('expected encrypt to throw');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        const httpErr = err as HttpException;
        expect(httpErr.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(httpErr.message).toBe(PII_MSG_KEY_UNAVAILABLE);
      }
    } finally {
      await moduleRef.close();
    }
  });
});
