import { randomBytes } from 'crypto';
import { AES_256_KEY_BYTES } from '../constants/aes-256-gcm.constants';
import { aes256GcmDecryptColon } from './aes-256-gcm-decrypt-colon.util';
import { aes256GcmEncryptColon } from './aes-256-gcm-encrypt-colon.util';
import { parseAes256KeyHex } from './parse-aes-256-key-hex.util';

describe('aes-256-gcm colon format (AC-9)', (): void => {
  const key = randomBytes(AES_256_KEY_BYTES);

  it('round-trips plaintext through iv:authTag:ciphertext', (): void => {
    const plain = 'passport-PII-sample-АБВ';
    const packed = aes256GcmEncryptColon(key, plain);
    const parts = packed.split(':');
    expect(parts).toHaveLength(3);
    for (const part of parts) {
      expect(part.length).toBeGreaterThan(0);
      expect(() => Buffer.from(part, 'base64')).not.toThrow();
    }
    expect(aes256GcmDecryptColon(key, packed)).toBe(plain);
  });

  it('parses a 64-hex key and rejects empty / invalid', (): void => {
    const hex = randomBytes(AES_256_KEY_BYTES).toString('hex');
    const parsed = parseAes256KeyHex(hex);
    expect(parsed).not.toBeNull();
    expect(parsed?.length).toBe(AES_256_KEY_BYTES);
    expect(parseAes256KeyHex('')).toBeNull();
    expect(parseAes256KeyHex('   ')).toBeNull();
    expect(() => parseAes256KeyHex('abcd')).toThrow();
  });
});
