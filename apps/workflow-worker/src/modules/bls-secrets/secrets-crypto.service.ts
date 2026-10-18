import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import type { AppEnv } from '../config';
import {
  SECRETS_AES_KEY_BYTES,
  SECRETS_KEY_VERSION_DEFAULT,
  SECRETS_MSG_DECRYPT_FAILED,
  SECRETS_MSG_MASTER_KEY_UNAVAILABLE,
} from './constants';
import type { SecretEnvelope } from './types';
import {
  aesGcmOpen,
  aesGcmSeal,
  parseSecretsMasterKey,
  unwrapDek,
  wrapDek,
} from './utils';

/**
 * Envelope encryption for portal / mailbox secrets (DEC-005 / REQ-014).
 * AES-256-GCM payload + per-secret DEK wrapped by VISES_SECRETS_MASTER_KEY.
 * Never hashes portal passwords. Never logs plaintext, DEK, or tokens.
 */
@Injectable()
export class SecretsCryptoService {
  constructor(private readonly config: ConfigService<AppEnv, true>) {}

  /**
   * Encrypt plaintext → envelope (ciphertext, nonce, wrappedDek, keyVersion).
   * Missing/invalid master key → 503 Russian detail (fail-closed).
   */
  async encryptSecret(plain: string): Promise<SecretEnvelope> {
    const masterKey = this.requireMasterKey();
    const dek = randomBytes(SECRETS_AES_KEY_BYTES);
    try {
      const payload = aesGcmSeal(dek, Buffer.from(plain, 'utf8'));
      const wrappedDek = wrapDek(masterKey, dek);
      return {
        ciphertext: payload.ciphertext,
        nonce: payload.nonce,
        wrappedDek,
        keyVersion: SECRETS_KEY_VERSION_DEFAULT,
      };
    } finally {
      dek.fill(0);
    }
  }

  /**
   * Decrypt envelope → plaintext (in-memory only for caller).
   * Missing/invalid master key → 503; auth failure → safe 503 detail.
   */
  async decryptSecret(envelope: SecretEnvelope): Promise<string> {
    const masterKey = this.requireMasterKey();
    let dek: Buffer | null = null;
    try {
      dek = unwrapDek(masterKey, envelope.wrappedDek);
      const plainBuf = aesGcmOpen(dek, envelope.nonce, envelope.ciphertext);
      return plainBuf.toString('utf8');
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        SECRETS_MSG_DECRYPT_FAILED,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } finally {
      if (dek) {
        dek.fill(0);
      }
    }
  }

  /** Resolve configured master key or fail closed with 503. */
  private requireMasterKey(): Buffer {
    const raw = this.config.get('VISES_SECRETS_MASTER_KEY', { infer: true });
    try {
      const key = parseSecretsMasterKey(raw);
      if (!key) {
        throw new HttpException(
          SECRETS_MSG_MASTER_KEY_UNAVAILABLE,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      return key;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        SECRETS_MSG_MASTER_KEY_UNAVAILABLE,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
