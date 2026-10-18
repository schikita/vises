/**
 * Envelope encryption constants (DEC-005 / REQ-014).
 * Named constants only — no helper functions.
 */

/** AES-256 key length (master key and per-secret DEK). */
export const SECRETS_AES_KEY_BYTES = 32;

/** AES-GCM nonce / IV length. */
export const SECRETS_GCM_NONCE_BYTES = 12;

/** AES-GCM authentication tag length. */
export const SECRETS_GCM_AUTH_TAG_BYTES = 16;

/** Default `bls_secret_vault.key_version` until rotation is implemented. */
export const SECRETS_KEY_VERSION_DEFAULT = 1;

/**
 * Fail-closed Russian detail when master key is missing/invalid at encrypt/decrypt
 * (503 — DEC-005). Never includes key material.
 */
export const SECRETS_MSG_MASTER_KEY_UNAVAILABLE =
  'Шифрование секретов недоступно: не задан или некорректен VISES_SECRETS_MASTER_KEY';

/** Safe Russian detail when unwrap/decrypt fails (no plaintext/DEK in message). */
export const SECRETS_MSG_DECRYPT_FAILED =
  'Не удалось расшифровать секрет хранилища';

/** Portal password minimum length (REQ-013). */
export const PORTAL_PASSWORD_MIN_LENGTH = 8;

/** Default generated portal password length (≥ min; includes all classes). */
export const PORTAL_PASSWORD_DEFAULT_LENGTH = 12;

/** Uppercase alphabet for portal password generation (ambiguous O omitted). */
export const PORTAL_PASSWORD_UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

/** Lowercase alphabet for portal password generation (ambiguous l omitted). */
export const PORTAL_PASSWORD_LOWER = 'abcdefghijkmnopqrstuvwxyz';

/** Digits for portal password generation (ambiguous 0/1 omitted). */
export const PORTAL_PASSWORD_DIGIT = '23456789';

/** Special characters for portal password generation (REQ-013). */
export const PORTAL_PASSWORD_SPECIAL = '!@#$%^&*-_=+';
