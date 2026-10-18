/** Public API for bls-secrets (envelope crypto + vault). */
export { BlsSecretsModule } from './bls-secrets.module';
export { SecretsCryptoService } from './secrets-crypto.service';
export { BlsSecretVaultService } from './bls-secret-vault.service';

export {
  SECRETS_AES_KEY_BYTES,
  SECRETS_GCM_NONCE_BYTES,
  SECRETS_GCM_AUTH_TAG_BYTES,
  SECRETS_KEY_VERSION_DEFAULT,
  SECRETS_MSG_MASTER_KEY_UNAVAILABLE,
  SECRETS_MSG_DECRYPT_FAILED,
  PORTAL_PASSWORD_MIN_LENGTH,
  PORTAL_PASSWORD_DEFAULT_LENGTH,
  PORTAL_PASSWORD_UPPER,
  PORTAL_PASSWORD_LOWER,
  PORTAL_PASSWORD_DIGIT,
  PORTAL_PASSWORD_SPECIAL,
  BLS_SECRET_PURPOSE,
  BLS_SECRET_PURPOSE_MAILBOX_CLEANUP,
} from './constants';

export type {
  SecretEnvelope,
  PersistBlsSecretInput,
  LoadBlsSecretInput,
  BlsSecretPurpose,
} from './types';

export {
  parseSecretsMasterKey,
  aesGcmSeal,
  aesGcmOpen,
  wrapDek,
  unwrapDek,
  generatePortalPassword,
} from './utils';
