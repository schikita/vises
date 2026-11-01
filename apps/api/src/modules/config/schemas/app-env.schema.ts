import { z } from 'zod';

/** AES-256 master key length for VISES_SECRETS_MASTER_KEY (DEC-005). */
const SECRETS_MASTER_KEY_BYTES = 32;

/** Hex length for VISES_PII_ENCRYPTION_KEY (32-byte AES-256). */
const PII_ENCRYPTION_KEY_HEX_LENGTH = 64;

/**
 * Full backend env bag validated at Nest ConfigModule boot (ConfigModule.validate).
 * Keys must be present (may be empty string where operators fill later).
 */
export const appEnvSchema = z.object({
  NODE_ENV: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  DEMO_AUTH_ENABLED: z.string(),
  UPLOAD_DIR: z.string(),
  VISES_PORTAL_BASE_URL: z.string(),
  VISES_PORTAL_REGISTER_PATH: z.string(),
  /** Portal login path (DEC-009 / REQ-006); empty/whitespace fails at URL resolve. */
  VISES_PORTAL_LOGIN_PATH: z.string(),
  CAPMONSTER_API_KEY: z.string(),
  /**
   * Proxy6 API key (https://px6.link/api/{key}/…). Empty ⇒ portal proxy leasing
   * disabled (direct browser egress). Non-empty trimmed ⇒ leasing enabled (REQ-022).
   * No buy period/country defaults in env (CON-009). No list TTL env (DEC-007).
   */
  PROXY6_API_KEY: z.string(),
  /**
   * RabbitMQ connection URL (DEC-013 / NFR-008). MessagingModule fail-closed
   * when empty/missing at publisher/consumer init.
   */
  RABBITMQ_URL: z.string(),
  /**
   * Envelope encryption master key (DEC-005 / REQ-014): base64 of exactly 32 bytes.
   * Empty allowed at boot (crypto unused); encrypt/decrypt fail-closed with 503.
   * Non-empty invalid length fails ConfigModule validation (never log the value).
   */
  VISES_SECRETS_MASTER_KEY: z.string().refine(
    (value) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return true;
      }
      return Buffer.from(trimmed, 'base64').length === SECRETS_MASTER_KEY_BYTES;
    },
    {
      message: `must be empty or base64-encoded ${SECRETS_MASTER_KEY_BYTES} bytes`,
    },
  ),
  /**
   * Root directory for Winston level folders (common/error/warn/info).
   * Required non-empty; created at logger init or boot fails.
   * Layout: `{LOG_DIR}/{channel}/{YYYY-MM}/{YYYY-MM-DD}.log`
   */
  LOG_DIR: z.string().trim().min(1),
  /**
   * Passport PII AES-256-GCM key (FR-6 / AC-9): exactly 64 hex chars (32 bytes).
   * Empty allowed at boot; encrypt/decrypt fail-closed with 503.
   * Non-empty invalid length/charset fails ConfigModule validation (never log the value).
   * Risk R-1: not rotatable in v1 — changing the key without re-encrypt loses ciphertext.
   */
  VISES_PII_ENCRYPTION_KEY: z.string().refine(
    (value) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return true;
      }
      return (
        trimmed.length === PII_ENCRYPTION_KEY_HEX_LENGTH &&
        /^[0-9a-fA-F]+$/.test(trimmed)
      );
    },
    {
      message: `must be empty or exactly ${PII_ENCRYPTION_KEY_HEX_LENGTH} hex characters`,
    },
  ),
  /**
   * Months after which `modules/pii` retention nulls FR-6 encrypted Client columns
   * (AC-11). Positive integer string; client row is kept.
   */
  PII_RETENTION_MONTHS: z.string().refine(
    (value) => {
      const trimmed = value.trim();
      if (!/^\d+$/.test(trimmed)) {
        return false;
      }
      const months = Number(trimmed);
      return Number.isInteger(months) && months > 0;
    },
    { message: 'must be a positive integer (months)' },
  ),
  /**
   * Static API key for visa-center monitor drafting→pending (FR-7.4 / AC-13).
   * Header: `X-Visa-Center-Monitor-Key`. Empty allowed at boot; requests fail-closed 401.
   * Never commit a real key — use `*.example` placeholders only.
   */
  VISES_VISA_CENTER_MONITOR_API_KEY: z.string(),
});
