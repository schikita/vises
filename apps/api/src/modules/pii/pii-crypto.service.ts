import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  aes256GcmDecryptColon,
  aes256GcmEncryptColon,
  parseAes256KeyHex,
} from '../../shared/utils';
import type { AppEnv } from '../config';
import {
  PII_ENCRYPTED_FIELD_KEYS,
  PII_MSG_DECRYPT_FAILED,
  PII_MSG_KEY_UNAVAILABLE,
} from './constants';
import { PiiAuditService } from './pii-audit.service';
import type { PiiEncryptedFieldMap, PiiReadAuditContext } from './types';

/**
 * AES-256-GCM passport PII crypto (FR-6 / AC-9 / AC-10).
 * Wire format `iv:authTag:ciphertext` (base64 segments); key from
 * `VISES_PII_ENCRYPTION_KEY`. Decrypt for operational reads audits via
 * {@link PiiAuditService}. Never logs plaintext or key material.
 */
@Injectable()
export class PiiCryptoService {
  constructor(
    private readonly config: ConfigService<AppEnv, true>,
    private readonly audit: PiiAuditService,
  ) {}

  /** Encrypt plaintext → packed ciphertext. Missing/invalid key → 503. */
  encrypt(plain: string): string {
    const key = this.requireKey();
    try {
      return aes256GcmEncryptColon(key, plain);
    } finally {
      key.fill(0);
    }
  }

  /**
   * Decrypt packed ciphertext → plaintext (in-memory for caller only).
   * Emits Winston audit with ciphertext prefix only (AC-10).
   */
  decrypt(packed: string, auditContext: PiiReadAuditContext): string {
    const key = this.requireKey();
    try {
      const plain = aes256GcmDecryptColon(key, packed);
      this.audit.logPassportRead(auditContext, packed);
      return plain;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(PII_MSG_DECRYPT_FAILED, HttpStatus.SERVICE_UNAVAILABLE);
    } finally {
      key.fill(0);
    }
  }

  /**
   * Encrypt a partial FR-6 field map (null/undefined left unchanged).
   * Non-null string values become packed ciphertext.
   */
  encryptFields(fields: PiiEncryptedFieldMap): PiiEncryptedFieldMap {
    const out: PiiEncryptedFieldMap = {};
    for (const key of PII_ENCRYPTED_FIELD_KEYS) {
      if (!(key in fields)) {
        continue;
      }
      const value = fields[key];
      if (value === null || value === undefined) {
        out[key] = value ?? null;
        continue;
      }
      out[key] = this.encrypt(value);
    }
    return out;
  }

  /**
   * Decrypt a partial FR-6 field map for operational use (audits once per
   * non-null field using the same audit context).
   */
  decryptFields(
    fields: PiiEncryptedFieldMap,
    auditContext: PiiReadAuditContext,
  ): PiiEncryptedFieldMap {
    const out: PiiEncryptedFieldMap = {};
    for (const key of PII_ENCRYPTED_FIELD_KEYS) {
      if (!(key in fields)) {
        continue;
      }
      const value = fields[key];
      if (value === null || value === undefined) {
        out[key] = value ?? null;
        continue;
      }
      out[key] = this.decrypt(value, auditContext);
    }
    return out;
  }

  /** Resolve configured PII key or fail closed with 503. */
  private requireKey(): Buffer {
    const raw = this.config.get('VISES_PII_ENCRYPTION_KEY', { infer: true });
    try {
      const key = parseAes256KeyHex(raw);
      if (!key) {
        throw new HttpException(
          PII_MSG_KEY_UNAVAILABLE,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      return key;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        PII_MSG_KEY_UNAVAILABLE,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
