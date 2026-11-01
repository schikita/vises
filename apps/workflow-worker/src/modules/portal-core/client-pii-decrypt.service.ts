import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  aes256GcmDecryptColon,
  parseAes256KeyHex,
} from '../../shared/utils';
import type { AppEnv } from '../config';
import type { Client } from '../database/entities/client.entity';
import {
  PII_MSG_DECRYPT_FAILED,
  PII_MSG_KEY_UNAVAILABLE,
} from './constants/pii-decrypt.constants';
import type { ApplicantInput } from './types/portal-mapping.types';
import { mapClientToApplicantList } from './utils/map-client-to-applicant-input.util';

/**
 * Minimal worker FR-6 decrypt for portal/BLS operational reads.
 * Uses v1-duplicated AES colon helpers under worker `shared/utils` + env
 * `VISES_PII_ENCRYPTION_KEY` (same format/key name as API `modules/pii`).
 * Fail-closed; never logs plaintext or key material.
 */
@Injectable()
export class ClientPiiDecryptService {
  constructor(private readonly config: ConfigService<AppEnv, true>) {}

  /**
   * Decrypt packed ciphertext → plaintext (in-memory for caller only).
   * Missing/invalid key or decrypt failure → 503.
   */
  decryptPacked(packed: string): string {
    const key = this.requireKey();
    try {
      return aes256GcmDecryptColon(key, packed);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        PII_MSG_DECRYPT_FAILED,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } finally {
      key.fill(0);
    }
  }

  /**
   * Client → single-element `ApplicantInput[]` with FR-6 fields decrypted.
   */
  toApplicantList(client: Client | null | undefined): ApplicantInput[] {
    return mapClientToApplicantList(client, (packed) =>
      this.decryptPacked(packed),
    );
  }

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
